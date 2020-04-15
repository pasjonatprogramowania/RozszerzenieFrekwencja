//function getBackupObjectFrequency() {
//    let bgpage = chrome.extension.getBackgroundPage();
//    let objectFrequency = bgpage.objectFrequency;
//
//    let promis = new Promise((resolve) => {
//        chrome.storage.local.get("objectFrequency", (result) => {
//            resolve(result["objectFrequency"])
//        });
//    });
//    let dataToLoad;
//    promis.then(data => {
//        dataToLoad = data;
//    }).then(() => {
//        setup(dataToLoad, objectFrequency, "frequency", "lessPerWeek", 37);
//    })
//}


export function semestrPresent(objFreq, week, freq, less) {
    console.log("elo")
    let present = [];
    present = objFreq.map((v, i) => (Math.round(100 - (v[freq] / (v[less] * week)) * 100)));
    return present;
}

export function createTable(objFreq, pres, freq) {
    let dataHtml = "";
    for (let i = 0; i < objFreq.length; i++) {
        dataHtml += `
        <tr>
            <td class="center-align">${objFreq[i].lessonName}</td>
            <td class="center-align" >
                <input type="number" class="input-default-weight" min="1" max="20" value="1">
                <i id="hint-default-weight" class="material-icons tooltipped" data-position="top" data-delay="250" data-tooltip="Ilość lekcji w tygodniu">info_outline</i>
            </td>  
            <td class="center-align">${objFreq[i][freq]}</td>
            <td class="center-align present">${pres[i]}%</td>
        </tr>`;

    }
    return dataHtml;
}

export function createSvg() {
    return document.getElementById("frequency").innerHTML += `
    <img src="error.png"> 
    <!-- Grafiak https://icons8.com/ouch/illustration/cherry-list-is-empty-1 -->`;
}

export function setup(backupObjectFrequency, objectFrequency, freq, less, week) {
    try {
        console.log(objectFrequency)
        console.log(backupObjectFrequency)

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
        present = semestrPresent(objectFrequency, week, freq, less);

        //Tworzenie Tabelki frekwencja
        document.getElementById("frequencyTable").innerHTML = createTable(objectFrequency, present, freq);

        let selectorInput = document.querySelectorAll('input');

        //Podmien wartosci w tabelce na te zapisane w pamieci lokalnej
        objectFrequency.forEach((item, index) => selectorInput[index].value = item[less]);

        document.querySelector("div.center-align a").addEventListener("click", () => saveChanges(objectFrequency, week, freq, less));

    } catch (error) {
        createSvg();
        console.log(error);
    }
}


export function saveChanges(objectFrequency, week, freq, less) {
    console.log("kliknołes przycisk")
    let selectorInput = document.querySelectorAll("input");
    objectFrequency.forEach((item, index) => {
        item[less] = parseInt(selectorInput[index].value, 10);
    });
    chrome.storage.local.set({
        objectFrequency: objectFrequency
    });

    let present = semestrPresent(objectFrequency, week, freq, less);
    console.log(present);
    document.querySelectorAll(".present").forEach((item, index) => item.innerText = `${present[index]}%`);
}
/*To Do
- Dodaj date ostatnirgo pobrania elementu do htmla 
- Popraw tooltipy Bład moze polegac na kolejnosci inicjalizacji najpierw moze zainicjowany musi byc ten obiekt do którego chce sie odwołac
- Sanityzacaj wpisanej wartosci przez usera
*/
