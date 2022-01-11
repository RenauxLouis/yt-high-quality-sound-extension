function getStoredStateIfExists() {
    chrome.storage.local.get(["action"], function (results) {
        isExtensionOn = results.action;
        var checkbox1 = document.getElementById("onOffButton");
        if (isExtensionOn) {
            checkbox1.checked = true;
        } else {
            checkbox1.checked = false;
        }
    });
}

try {
    getStoredStateIfExists();
} catch (error) {
    console.error(error);
    document.getElementById("onOffButton").checked = true;
    var isExtensionOn = true;
}

document.getElementById("onOffButton").addEventListener("click", function () {
    isExtensionOn = document.getElementById("onOffButton").checked;
    chrome.storage.local.set({ action: isExtensionOn });
});
