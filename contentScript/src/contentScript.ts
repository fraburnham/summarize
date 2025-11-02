type MessageSender = chrome.runtime.MessageSender;

type InjectTextRequest = {
  action: "injectText";
  source: string;
  replacement: string;
}

// TODO: try to eliminate the undefined response?
function findRootStringContainer(source: string, es: Element[], candidate?: HTMLElement | undefined): HTMLElement | undefined {
  if (es.length == 0) {
    return candidate;
  }

  let e = es[0];

  if (e instanceof HTMLElement) {
    let text = e.innerText.replace(/\n/gm, " ");

    if (text == source) {
      return e
    }

    if (text.indexOf(source) != -1) {
      candidate = e;
    }

    return findRootStringContainer(
      source,
      es.slice(1).concat(Array.from(e.children)),
      candidate
    )
  }

  return findRootStringContainer(
    source,
    es.slice(1),
    candidate
  )
}

function injectText(source: string, replacement: string) {
  let rootContainer = findRootStringContainer(source, [document.documentElement]);

  if (! (rootContainer instanceof HTMLElement)) {
    console.log("Failed to inject summary");
    return;
  }

  for (let child of rootContainer.children) {
    // TODO: remove all punctuation from child.innerText so that junk doesn't match
    //       also remove all \W and make sure the string is more than zero length (to avoid over hover attachment)
    if (child instanceof HTMLElement && source.indexOf(child.innerText) != -1) {
      child.title = replacement;
    }
  }
}

chrome.runtime.onMessage.addListener(function (
  request: InjectTextRequest,
  _sender: MessageSender,
  _sendResponse: (response?: unknown) => void,
) {
  console.log("Got message");
  console.log(request);

  switch (request.action) {
    case "injectText":
      injectText(request.source, request.replacement);
      return false;
    default:
      console.log(`Skipping request with action ${request.action}`);
      return false;
  }
});

console.log("Content script loaded");
