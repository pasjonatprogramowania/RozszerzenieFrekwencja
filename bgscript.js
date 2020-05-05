console.log("I am bgscript");

chrome.runtime.onMessage.addListener(receiver);

window.yearObjectFrequency = {};
window.firstObjectFrequency = {};
window.secondObjectFrequency = {};
window.simObjectFrequency = {};

function receiver(request, sender, sendResponse) {
    if (request[0].type == "y") {
        let dummyObjectFrequency = [];
        request.forEach((item, index) => dummyObjectFrequency[index] = item.lessPerWeek)
        chrome.storage.local.get("yearObjectFrequency", (result) => {
            if (result.yearObjectFrequency != undefined) {
                result.yearObjectFrequency.forEach((item, index) => dummyObjectFrequency[index] = item.lessPerWeek);

                request.forEach((item, index) => item.lessPerWeek = dummyObjectFrequency[index])

                window.yearObjectFrequency = request;
                chrome.storage.local.set({
                    yearObjectFrequency: request
                });
            } else {
                window.yearObjectFrequency = request;
                chrome.storage.local.set({
                    yearObjectFrequency: request
                });
            }
        });
    }
    if (request[0].type == "f") {
        let dummyObjectFrequency = [];
        request.forEach((item, index) => dummyObjectFrequency[index] = item.lessPerWeek)
        chrome.storage.local.get("firstObjectFrequency", (result) => {
            if (result.firstObjectFrequency != undefined) {
                result.firstObjectFrequency.forEach((item, index) => dummyObjectFrequency[index] = item.lessPerWeek);

                request.forEach((item, index) => item.lessPerWeek = dummyObjectFrequency[index])

                window.firstObjectFrequency = request;
                chrome.storage.local.set({
                    firstObjectFrequency: request
                });
            } else {
                window.firstObjectFrequency = request;
                chrome.storage.local.set({
                    firstObjectFrequency: request
                });
            }
        });
    }
    if (request[0].type == "s") {
        let dummyObjectFrequency = [];
        request.forEach((item, index) => dummyObjectFrequency[index] = item.lessPerWeek)
        chrome.storage.local.get("secondObjectFrequency", (result) => {
            if (result.secondObjectFrequency != undefined) {
                result.secondObjectFrequency.forEach((item, index) => dummyObjectFrequency[index] = item.lessPerWeek);

                request.forEach((item, index) => item.lessPerWeek = dummyObjectFrequency[index])

                window.secondObjectFrequency = request;
                chrome.storage.local.set({
                    secondObjectFrequency: request
                });
            } else {
                window.secondObjectFrequency = request;
                chrome.storage.local.set({
                    secondObjectFrequency: request
                });
            }
        });
    }
    if (request[0].type == "sim") {
        let dummyObjectFrequency = [];
        request.forEach((item, index) => dummyObjectFrequency[index] = item.lessPerWeek)
        chrome.storage.local.get("simObjectFrequency", (result) => {
            if (result.simObjectFrequency != undefined) {
                result.simObjectFrequency.forEach((item, index) => dummyObjectFrequency[index] = item.lessPerWeek);

                request.forEach((item, index) => item.lessPerWeek = dummyObjectFrequency[index])

                window.simObjectFrequency = request;
                chrome.storage.local.set({
                    simObjectFrequency: request
                });
            } else {
                window.simObjectFrequency = request;
                chrome.storage.local.set({
                    simObjectFrequency: request
                });
            }
        });
    }

    console.log('yearObjectFrequency', yearObjectFrequency);

    console.log('firstObjectFrequency', firstObjectFrequency);

    console.log('secondObjectFrequency', secondObjectFrequency);

    console.log('simObjectFrequency', simObjectFrequency);
}
