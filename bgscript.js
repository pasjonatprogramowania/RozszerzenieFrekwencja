console.log("I am bgscript");

chrome.runtime.onMessage.addListener(receiver);

window.objectFrequency = {};

function receiver(request, sender, sendResponse) {
    console.log(request);
    window.objectFrequency = request;

}
console.log(window.objectFrequency);
