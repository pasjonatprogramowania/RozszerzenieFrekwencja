//Błogosławienie ci którzy nie rozumieli po co te pentle i zmienne a uwierzyli 
document.addEventListener('load', getBackupobjectAverage());

function getBackupobjectAverage() {
    let bgpage = chrome.extension.getBackgroundPage();
    let objectAverage = bgpage.proviteAverage;

    let promisAverage = new Promise(resolve => {
        chrome.storage.local.get("proviteAverage", result => {
            resolve(result["proviteAverage"]);
        });
    });

    let promisSettings = new Promise(resolve => {
        chrome.storage.local.get("settings", result => {
            resolve(result["settings"]);
        });
    });

    let backup;
    promisAverage.then(data => {
        backup = data;
    });
    let settings;
    promisSettings
        .then(data => {
            settings = data;
        })
        .then(() => {
            setup(backup, objectAverage, settings);
        });
}

function setup(backupObjectAverage, objectAverage, settings) {
    try {

        console.log('objectAverage', objectAverage)
        console.log('backupObjectAverage', backupObjectAverage)
        console.log('settings', settings)

        if (Array.isArray(objectAverage)) {
            console.log("Nie musze wczytywac backupu");
        } else if (
            !Array.isArray(objectAverage) &&
            backupObjectAverage != undefined
        ) {
            console.log("Uwaga wczytuje backup");
            objectAverage = backupObjectAverage;
        } else {
            console.log("Nie znalazłem nic, dla bezpiecenstwa żucam wyjątkiem");
            throw new SyntaxError("Nie wykryto frekwencji");
        }

        let today = new Date();
        let day = String(today.getDate()).padStart(2, "0");
        let month = String(today.getMonth() + 1).padStart(2, "0");
        let year = today.getFullYear();
        let contentLastOpenDate = `${day}.${month}.${year}`;

        if (contentLastOpenDate != objectAverage[0].lastOpenDate) {
            let selectorLastOpenDate = document.querySelector("#lastOpenDate");
            selectorLastOpenDate.style = "display:block";
            selectorLastOpenDate.innerHTML += `<div>Średnia z dnia: ${objectAverage[0].lastOpenDate}</div>`;
        }

        let dataHtml = "";
        dataHtml += `
        <tr style="height:112px">
            <td class="center-align lessonName">Średnia Roczna</td>
            <td class="center-align flow-text" >${(objectAverage[0].yearAverageProvite).toFixed(2)}</td> 
            <td class="center-align flow-text frequency"><input type="number" class="input-default-weight"></td>
            <td class="center-align flow-text present" name="compered">0</td>
        </tr>`;

        document.getElementById("frequencyTable").innerHTML = dataHtml;

        document
            .querySelector("div.center-align a")
            .addEventListener("click", () => saveChanges(objectAverage, settings));
    } catch (err) {
        document.querySelector("#frequency").innerHTML += `
        <img src="error.png"> 
        <!-- Grafiak https://icons8.com/ouch/illustration/cherry-list-is-empty-1 -->`;
    }
}

function saveChanges(objectAverage, settings) {
    let goalSelector = document.querySelector(`input[type="number"]`);
    let goalAverage = Math.abs(goalSelector.value) * objectAverage[0].yearAverageRounded.length;

    let howMuchMissing = Math.round(goalAverage - objectAverage[0].yearAverageRoundedSume);
    if (howMuchMissing >= 0) {
        if (goalSelector.value > 6) {
            goalAverage = Math.abs(6) * objectAverage[0].yearAverageRounded.length;

            howMuchMissing = Math.round(goalAverage - objectAverage[0].yearAverageRoundedSume);
            /*Wyswietl date pobrania */
            document.querySelector(`td[name="compered"]`).innerText = howMuchMissing;
            goalSelector.value = 6;
        } else {
            document.querySelector(`td[name="compered"]`).innerText = howMuchMissing;
        }
    } else {
        document.querySelector(`td[name="compered"]`).innerHTML = 0;
        goalSelector.value = 0;
    }
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
        html: 'Zmiany zostały zapisane',
        classes: 'toast-container',
        inDuration: 300,
        outDuration: 300
    });
});