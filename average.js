document.addEventListener("DOMContentLoaded", function () {
    var elems = document.querySelectorAll(".collapsible");
    var instances = M.Collapsible.init(elems);
});
//Materilize css Navbar
document.addEventListener("DOMContentLoaded", function () {
    let elems = document.querySelectorAll(".sidenav");
    let instances = M.Sidenav.init(elems);
});
////Materialize css tooltip
$("document").ready(function () {
    let elems = document.querySelectorAll(".tooltipped");
    let instances = M.Tooltip.init(elems);
});

document.addEventListener("load", getBackupobjectAverage());

function getBackupobjectAverage() {
    let bgpage = chrome.extension.getBackgroundPage();
    let objectAverage = bgpage.averageObject;

    let promisAverage = new Promise(resolve => {
        chrome.storage.local.get("averageObject", result => {
            resolve(result["averageObject"]);
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
    console.log("objectAverage", objectAverage);
    console.log("backupObjectAverage", backupObjectAverage);
    console.log("settings", settings);

    try {
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

        objectAverage.forEach((item, index) => {
            if (item.firstSemestr == null || item.firstSemestr == undefined) {
                item.firstSemestr = "-";
            }
            if (item.secondSemestr == null || item.secondSemestr == undefined) {
                item.secondSemestr = "-";
            }
            if (item.year == null || item.year == undefined) {
                item.year = "-";
            }
        });

        let today = new Date();
        let day = String(today.getDate()).padStart(2, "0");
        let month = String(today.getMonth() + 1).padStart(2, "0");
        let year = today.getFullYear();
        let contentLastOpenDate = `${day}.${month}.${year}`;

        if (contentLastOpenDate != objectAverage[0].lastOpenDate) {
            let selectorLastOpenDate = document.querySelector("#lastOpenDate");
            selectorLastOpenDate.style = "display:block";
            selectorLastOpenDate.innerHTML += `<div>Oceny z dnia: ${objectAverage[0].lastOpenDate}</div>`;
        }

        let dataHtml = "";
        if (settings == undefined) {
            settings = [""];
        }
        if (settings[0].hightlight == true) {
            let fSAverage = [];
            let sSAverage = [];
            let yAverage = [];

            fSAverage = comperAverage("firstSemestr", objectAverage);
            sSAverage = comperAverage("secondSemestr", objectAverage);
            yAverage = comperAverage("year", objectAverage);
            for (let i = 0; i < objectAverage.length; i++) {
                dataHtml += `
        <tr name="${objectAverage[i].lessonName}"style="height:112px">
            <td class="center-align lessonName" >${objectAverage[i].lessonName}</td>
            <td class="center-align flow-text" >${fSAverage[i]}</td>  
            <td class="center-align flow-text frequency">${sSAverage[i]}</td>
            <td class="center-align flow-text present">${yAverage[i]}</td>
        </tr>`;
            }
        } else {
            for (let i = 0; i < objectAverage.length; i++) {
                dataHtml += `
        <tr name="${objectAverage[i].lessonName}"style="height:112px">
            <td class="center-align lessonName" >${objectAverage[i].lessonName}</td>
            <td class="center-align flow-text" >${objectAverage[i].firstSemestr}</td>  
            <td class="center-align flow-text frequency">${objectAverage[i].secondSemestr}</td>
            <td class="center-align flow-text present">${objectAverage[i].year}</td>
        </tr>`;
            }
        }
        document.getElementById("frequencyTable").innerHTML = dataHtml;
        if (settings[0].hide == true) {
            let arraylessonToHide = [];
            settings[0].lessonToHide.forEach(
                (item, index) => (arraylessonToHide[index] = item)
            );
            arraylessonToHide.forEach((item, index) => {
                if (document.querySelector(`tr[name="${item}"]`) != null) {
                    document.querySelector(`tr[name="${item}"]`).style.display = "none";
                }
            });
        }
    } catch (error) {
        document.querySelector("#frequency").innerHTML += `
        <img src="img/error.png"> 
        <!-- Grafiak https://icons8.com/ouch/illustration/cherry-list-is-empty-1 -->`;
    }
}

function comperAverage(val, objectAverage) {
    let comperArray = [];
    for (let i = 0; i < objectAverage.length; i++) {
        if (objectAverage[i][val] >= 5) {
            comperArray[i] = `
      <span class="green-text">${objectAverage[i][val]}</span>`;
        } else if (objectAverage[i][val] >= 4) {
            comperArray[i] = `
      <span class="light-green-text">${objectAverage[i][val]}</span>`;
        } else if (objectAverage[i][val] >= 3) {
            comperArray[i] = `
      <span class="amber-text">${objectAverage[i][val]}</span>`;
        } else if (objectAverage[i][val] >= 2) {
            comperArray[i] = `
      <span class="orange-text">${objectAverage[i][val]}</span>`;
        } else if (objectAverage[i][val] >= 1) {
            comperArray[i] = `
      <span class="red-text">${objectAverage[i][val]}</span>`;
        } else {
            comperArray[i] = `
      <span>${objectAverage[i][val]}</span>`;
        }
    }
    return comperArray;
}