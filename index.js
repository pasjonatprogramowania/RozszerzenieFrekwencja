import {
    setup
} from "/popup.js"

//Błogosławienie ci którzy nie rozumieli po co te pentle i zmienne a uwierzyli 
document.addEventListener('laod', getBackupObjectFrequency());

function getBackupObjectFrequency() {
    let bgpage = chrome.extension.getBackgroundPage();
    let objectFrequency = bgpage.yearObjectFrequency;

    let promisFrequency = new Promise((resolve) => {
        chrome.storage.local.get("yearObjectFrequency", (result) => {
            resolve(result["yearObjectFrequency"])
        });
    });
    let promisSettings = new Promise((resolve) => {
        chrome.storage.local.get("settings", (result) => {
            resolve(result["settings"])
        });
    });
    let backup;
    promisFrequency.then(data => {
        backup = data;
    })
    let settings;
    promisSettings.then(data => {
        settings = data
    }).then(() => {
        setup(backup, objectFrequency, settings);
    })
}
//Materilize css Navbar
document.addEventListener('DOMContentLoaded', function () {
    let elems = document.querySelectorAll('.sidenav');
    let instances = M.Sidenav.init(elems);
});

////Materialize css tooltip
$("document").ready(function () {
    let elems = document.querySelectorAll('.tooltipped');
    let instances = M.Tooltip.init(elems);
});

// Materialize css Toast
document.querySelector('a.btn-large').addEventListener('click', () => {
    M.toast({
        html: 'Zmiany zosatły zapisane',
        classes: 'toast-container',
        inDuration: 300,
        outDuration: 300,
        activationPercent: 0.8,
    });
});

/*To Do

*/
