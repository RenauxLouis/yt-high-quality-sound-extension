chrome.runtime.onInstalled.addListener(function() {
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // changeInfo object: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated#changeInfo
    // status is more reliable (in my case)
    // use "alert(JSON.stringify(changeInfo))" to check what's available and works in your case
    if (changeInfo.status === "complete") {
      chrome.tabs.sendMessage(tabId, {
        message: 'TabUpdated'
      });
    }
  })
});

function setIcon() {
  chrome.storage.local.get(["action"], function (results) {
    isExtensionOn = results.action;
    if (isExtensionOn) {
      chrome.action.setIcon({path: "icons/iconon-38.png"});
    } else {
      chrome.action.setIcon({path: "icons/iconoff-38.png"});
    }
  });
}

chrome.storage.onChanged.addListener(function (changes) {
  isExtensionOn = changes.action.newValue;
  console.log(isExtensionOn);

  if (isExtensionOn) {
    chrome.action.setIcon({path: "icons/iconon-38.png"});
  } else {
    chrome.action.setIcon({path: "icons/iconoff-38.png"});
  }
});

setIcon();