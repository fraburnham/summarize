type OnClickData = chrome.contextMenus.OnClickData
type Tab = chrome.tabs.Tab | undefined

// TODO: this should check if the context menu has already been added first
chrome.contextMenus.create({
  contexts: ["selection"],
  documentUrlPatterns: ["<all_urls>"],
  id: "getSummary",
  title: "Summarize",
});

async function contextMenuClick(info: OnClickData, tab: Tab) {
  switch (info.menuItemId) {
    case "getSummary":
      if (info.selectionText == undefined) {
        console.log("Didn't get any selected text...");
        return;
      }

      if (tab === undefined || tab.id === undefined) {
        console.log("Don't know which tab to update...");
        return;
      }

      chrome.storage.local.get(["config"], (response) => {
        console.log(response.config);

        fetch(
          `${response.config.ollamaUrl}/v1/chat/completions`,
          {
            method: "POST",
            headers: {"content-type": "application/json"},
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
              model: response.config.model,
              messages: [
                {
                  role: "system",
                  content: "Your job is to summarize text as correctly as possible. Never make the summary too short to express the ideas in the original. The text to summarize follows:",
                },
                {
                  role: "user",
                  content: info.selectionText
                }
              ]
            })
          }
        ).then((response) => {
          response.json().then((parsed) => {
            console.log(parsed);
            console.log("Would notify contentScript");
            if (tab.id !== undefined) { // don't really like that I have to do this twice...
              chrome.tabs.sendMessage(tab.id, {
                action: "injectText",
                source: info.selectionText,
                replacement: parsed["choices"][0]["message"]["content"],
              });
            } else {
              console.log("Don't know which tab to update...");
            }
          });
        });
      });
      return;

    default:
      console.log(`Skipping context menu click with id '${info.menuItemId}'`);
  }
}

chrome.contextMenus.onClicked.addListener(contextMenuClick);
