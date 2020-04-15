import {
    semestrPresent,
    createTable,
    createSvg,
    saveChanges,
    setup
} from "/popup.js"

//Błogosławienie ci którzy nie rozumieli po co te pentle i zmienne a uwierzyli 
document.addEventListener('load', getBackupObjectFrequency());

function getBackupObjectFrequency() {
    let promis = new Promise((resolve) => {
        chrome.storage.local.get("objectFrequency", (result) => {
            resolve(result["objectFrequency"])
        });
    });
    let dataToLoad;
    promis.then(data => {
        dataToLoad = data;
    }).then(() => {
        setup(dataToLoad);
    })
}

//Funkcja głowna wykonuje sie jako 2 poniewaz musi otrzymac backup ze storydzu
function setup(backupObjectFrequency) {
    //    try {
    let bgpage = chrome.extension.getBackgroundPage();
    let objectFrequency = bgpage.objectFrequency;
    console.log(objectFrequency)
    console.log(backupObjectFrequency)
    // Tymczosowo przpisz do biektu i daj jako zmeinna w nim
    let weeksInYear = 37;
    if (!(Array.isArray(objectFrequency)) && typeof backupObjectFrequency !== "undefined") {
        console.log("Uwaga wczytuje backup");
        objectFrequency = backupObjectFrequency;
    } else if (Array.isArray(objectFrequency)) {
        console.log("Nie musze wczytywac backupu");
        chrome.storage.local.set({
            objectFrequency: objectFrequency
        });
    } else {
        console.log("Nie znalazłem nic, dla bezpiecenstwa żucam wyjątkiem");
        throw new SyntaxError("Nie wykryto frekwencji");
    }

    //Jesli frekwencja nie jest z tego dnia co powinna byc uzytkownik dostanie o tym informacje
    let today = new Date();
    let contentLastOpenDate = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear();
    if (contentLastOpenDate != objectFrequency[0].lastOpenDate) {
        let selectorLastOpenDate = document.querySelector("#lastOpenDate");
        selectorLastOpenDate.style = 'display:block';
        selectorLastOpenDate.innerText += `Frekwencja z dnia: ${objectFrequency[0].lastOpenDate}`;
    }
    //Obliczanie frekwencji
    let present = [];
    present = semestrPresent(objectFrequency, weeksInYear);

    //Tworzenie Tabelki frekwencja
    document.getElementById("frequencyTable").innerHTML = createTable(objectFrequency, present);

    let selectorInput = document.querySelectorAll('input');
    //Podmien wartosci w tabelce na te zapisane w pamieci lokalnej
    objectFrequency.forEach((item, index) => selectorInput[index].value = item.lessPerWeek);

    document.querySelector("div.center-align a").addEventListener("click", function () {
        console.log("kliknołes przycisk")
        let selectorInput = document.querySelectorAll("input");
        objectFrequency.forEach((item, index) => {
            item.lessPerWeek = parseInt(selectorInput[index].value, 10);
        });
        chrome.storage.local.set({
            objectFrequency: objectFrequency
        });

        let present = semestrPresent(objectFrequency, weeksInYear);
        document.querySelectorAll(".present").forEach((item, index) => item.innerText = `${present[index]}%`);
    });
    //    } catch (error) {
    //        createSvg();
    //    }
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
