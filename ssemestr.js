import {
    semestrPresent,
    createTable,
    createSvg,
    setup,
    saveChanges
} from "/popup.js"

//Błogosławienie ci którzy nie rozumieli po co te pentle i zmienne a uwierzyli 
document.addEventListener('load', getBackupObjectFrequency());

function getBackupObjectFrequency() {
    let bgpage = chrome.extension.getBackgroundPage();
    let objectFrequency = bgpage.objectFrequency;

    let promis = new Promise((resolve) => {
        chrome.storage.local.get("objectFrequency", (result) => {
            resolve(result["objectFrequency"])
        });
    });
    let dataToLoad;
    promis.then(data => {
        dataToLoad = data;
    }).then(() => {
        setup(dataToLoad, objectFrequency, "frequencySecondSemestr", "lessPerWeekSecond", 20);
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
})

// Materialize css Toast
document.querySelector('a.btn-large').addEventListener('click', () => {
    M.toast({
        html: 'Zmiany zosatły zapisane',
        classes: 'toast-container',
        inDuration: 300,
        outDuration: 300
    });
});

/*To Do
- Dodaj date ostatnirgo pobrania elementu do htmla 
- Popraw tooltipy Bład moze polegac na kolejnosci inicjalizacji najpierw moze zainicjowany musi byc ten obiekt do którego chce sie odwołac
- Sanityzacaj wpisanej wartosci przez usera
*/
