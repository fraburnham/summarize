//
// Load the app
//
var app = Gren.Main.init({
  node: document.getElementById('gren'),
  flags: Date.now()
});

//
// js interop
//
const storage = chrome.storage.local;

//
// get config
//
storage.get("config").then((configData) => {
  if (configData.config === undefined) {
    console.log("updating");
    configData.config = {};
  }
  console.log(`Got config: ${JSON.stringify(configData.config)}`);
  app.ports.getConfig.send(JSON.stringify(configData.config));
});

//
// store config
//
app.ports.storeConfig.subscribe(function(message) {
  console.log(`Stored config: ${JSON.stringify(message)}`);
  storage.set({
    config: message
  })
});
