export function presentCounter(objectFrequency) {
    let present = [];
    present = objectFrequency.map((v, i) => (Math.round(100 - (v.frequency / (v.lessPerWeek * v.week)) * 100)));
    present.forEach((item, index) => {
        if (!(isFinite(item))) {

            present[index] = '🎉CTF';
        }
    });
    return present;
}

export function createTable(objectFrequency) {
    let dataHtml = "";
    for (let i = 0; i < objectFrequency.length; i++) {
        dataHtml += `
        <tr name="${objectFrequency[i].lessonName}">
            <td class="center-align lessonName" >${objectFrequency[i].lessonName}</td>
            <td class="center-align flow-text" >
                <input type="number" class="input-default-weight" min="1" max="20" value="1">
                <i id="hint-default-weight" class="material-icons tooltipped" data-position="top" data-delay="250" data-tooltip="Ilość lekcji w tygodniu">info_outline</i>
            </td>  
            <td class="center-align flow-text frequency">${objectFrequency[i].frequency}</td>
            <td class="center-align flow-text present">${objectFrequency[i].pressent}%</td>
        </tr>`;

    }
    return dataHtml;
}

export function createSvg(val) {
    return document.querySelector(val).innerHTML += `
    <img src="error.png"> 
    <!-- Grafiak https://icons8.com/ouch/illustration/cherry-list-is-empty-1 -->`;
}

export function setup(backupObjectFrequency, objectFrequency, settings) {
    try {
        console.log('objectFrequency', objectFrequency);
        console.log('backupObjectFrequency', backupObjectFrequency);
        console.log('settings', settings);

        if (Array.isArray(objectFrequency)) {
            console.log("Nie musze wczytywac backupu");
        } else if (!(Array.isArray(objectFrequency)) && backupObjectFrequency != undefined) {
            console.log("Uwaga wczytuje backup");
            objectFrequency = backupObjectFrequency;
        } else {
            console.log("Nie znalazłem nic, dla bezpiecenstwa żucam wyjątkiem");
            throw new SyntaxError("Nie wykryto frekwencji");
        }
        console.log('objectFrequency', objectFrequency);

        displayDateWhenbackup(objectFrequency, settings);

        //Tworzenie Tabelki frekwencja
        doSettings(settings, objectFrequency);

        document.querySelector("div.center-align a").addEventListener("click", () => saveChanges(objectFrequency, settings));

    } catch (error) {
        createSvg("#frequency");
        console.log(error);
    }
}


export function displayDateWhenbackup(objectFrequency, settings) {
    //Jesli frekwencja nie jest z tego dnia co powinna byc uzytkownik dostanie o tym informacje
    let today = new Date();
    let contentLastOpenDate = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear();
    if (settings == undefined) {
        settings = [""];
    }

    if (contentLastOpenDate != objectFrequency[0].lastOpenDate) {
        let selectorLastOpenDate = document.querySelector("#lastOpenDate");
        selectorLastOpenDate.style = 'display:block';
        selectorLastOpenDate.innerHTML += `<div>Frekwencja z dnia: ${objectFrequency[0].lastOpenDate}</div>`;
    }
    if (settings[0].state == true) {
        let selectorLastOpenDate = document.querySelector("#lastOpenDate");
        selectorLastOpenDate.style = 'display:block';
        selectorLastOpenDate.innerHTML += `<div>Odejmowanie stałej jest <span style="color:#4caf50">włączone</span></div>`;
    }
}

export function doSettings(settings, objectFrequency) {
    //Obliczanie frekwencji
    let present = [];
    present = presentCounter(objectFrequency);

    if (settings == undefined) {
        settings = [""];
    }
    if (settings[0].state == true && isFinite(settings[0].stateValue)) {
        let presentState = [];
        let val = settings[0].stateValue
        present.forEach((item, index) => {
            if (item != '🎉CTF') {
                presentState[index] = item - val;
            } else {
                presentState[index] = item
            }
        });
        objectFrequency.forEach((item, index) => item.present = presentState[index]);
    } else {
        objectFrequency.forEach((item, index) => item.present = present[index]);
    }

    document.getElementById("frequencyTable").innerHTML = createTable(objectFrequency);

    if (settings[0].hide == true) {
        let arraylessonToHide = [];
        settings[0].lessonToHide.forEach((item, index) => arraylessonToHide[index] = item);
        arraylessonToHide.forEach((item, index) => {
            if (document.querySelector(`tr[name="${item}"]`) != null) {
                document.querySelector(`tr[name="${item}"]`).style.display = "none"
            }
        });
    }
    //Pobieranie wartosci z inputów 
    let selectorTr = document.querySelectorAll('tr');
    let selectorInput = document.querySelectorAll('input');
    objectFrequency.forEach((item, index) => {
        selectorInput[index].value = Math.round(item.lessPerWeek * 10 / 10);
        selectorTr[index].value = selectorInput[index].value;
    });

    if (settings[0].hightlight == true) {
        let presentSelector = document.querySelectorAll(".present");
        objectFrequency.forEach((item, index) => colorPresent(presentSelector, item, index));
    } else {
        let presentSelector = document.querySelectorAll(".present");

        objectFrequency.forEach((item, index) => presentSelector[index].innerHTML = `${item.present}%`);
    }

}

export function saveChanges(objectFrequency, settings, ) {
    console.log("kliknołes przycisk")

    let selectorInput = document.querySelectorAll("input");

    objectFrequency.forEach((item, index) => {
        item.lessPerWeek = Math.round(selectorInput[index].value * 10 / 10);
    });

    if (objectFrequency[0].type == "y") {
        chrome.storage.local.set({
            yearObjectFrequency: objectFrequency
        });
    }
    if (objectFrequency[0].type == "f") {
        chrome.storage.local.set({
            firstObjectFrequency: objectFrequency
        });
    }
    if (objectFrequency[0].type == "s") {
        chrome.storage.local.set({
            secondObjectFrequency: objectFrequency
        });
    }
    if (objectFrequency[0].type == "sim") {
        chrome.storage.local.set({
            simObjectFrequency: objectFrequency
        });
    }
    doSettings(settings, objectFrequency);

}

export function colorPresent(presentSelector, item, index) {
    if (item.present >= 90) {
        presentSelector[index].innerHTML = `<span class="green-text">${item.present}%</span>`;
    } else if (item.present >= 70) {
        presentSelector[index].innerHTML = `<span class="light-green-text">${item.present}%</span>`;
    } else if (item.present >= 50) {
        presentSelector[index].innerHTML = `<span class="amber-text">${item.present}%</span>`;
    } else if (item.present >= 30) {
        presentSelector[index].innerHTML = `<span class="orange-text">${item.present}%</span>`;
    } else {
        presentSelector[index].innerHTML = `<span class="red-text">${item.present}%</span>`;
    }
}
export function simSetup(backupObjectFrequency, objectFrequency, settings) {
    try {

        console.log('objectFrequency', objectFrequency);
        console.log('backupObjectFrequency', backupObjectFrequency);
        console.log('settings', settings);

        if (Array.isArray(objectFrequency)) {
            console.log("Nie musze wczytywac backupu");
        } else if (!(Array.isArray(objectFrequency)) && backupObjectFrequency != undefined) {
            console.log("Uwaga wczytuje backup");
            objectFrequency = backupObjectFrequency;
        } else {
            console.log("Nie znalazłem nic, dla bezpiecenstwa żucam wyjątkiem");
            throw new SyntaxError("Nie wykryto frekwencji");
        }

        displayDateWhenbackup(objectFrequency, settings);

        doSimSettings(objectFrequency, settings)

        document.querySelector("div.center-align a").addEventListener("click", () => saveSimChanges(objectFrequency, settings));

    } catch (error) {
        createSvg("#frequency");
        console.log(error);
    }
}


export function simCreateTable(objectFrequency) {
    let dataHtml = "";
    for (let i = 0; i < objectFrequency.length; i++) {
        dataHtml += `
        <tr name="${objectFrequency[i].lessonName}">
            <td class="center-align lessonName" >${objectFrequency[i].lessonName}</td>
            <td class="center-align flow-text" >
                <input type="number" class="input-default-weight lessPerWeek" min="0" max="20" value="${objectFrequency[i].lessPerWeek}">
                <i id="hint-default-weight" class="material-icons tooltipped" data-position="top" data-delay="250" data-tooltip="Ilość lekcji w tygodniu">info_outline</i>
            </td>  
            <td class="center-align flow-text">
                <input type="number" class="input-default-weight frequency" min="0" max="30" value="${objectFrequency[i].frequency}">
                <i id="hint-default-weight" class="material-icons tooltipped" data-position="top" data-delay="250" data-tooltip="Nieobecne godziny">info_outline</i>
            </td>
            <td class="center-align flow-text present">${objectFrequency[i].pressent}%</td>
        </tr>`;
    }
    return dataHtml;
}

export function saveSimChanges(objectFrequency, settings) {
    console.log("kliknołes przycisk")

    let selectorLessPerWeek = document.querySelectorAll('.lessPerWeek');
    let selectorFrequency = document.querySelectorAll('.frequency');

    objectFrequency.forEach((item, index) => {
        item.lessPerWeek = Math.round(selectorLessPerWeek[index].value * 10 / 10);
        item.frequency = Math.round(selectorFrequency[index].value * 10 / 10);
    });

    if (objectFrequency[0].type == "y") {
        chrome.storage.local.set({
            yearObjectFrequency: objectFrequency
        });
    }
    if (objectFrequency[0].type == "f") {
        chrome.storage.local.set({
            firstObjectFrequency: objectFrequency
        });
    }
    if (objectFrequency[0].type == "s") {
        chrome.storage.local.set({
            secondObjectFrequency: objectFrequency
        });
    }
    doSimSettings(objectFrequency, settings)

    document.querySelector("div.center-align a").addEventListener("click", () => saveSimChanges(objectFrequency, settings));
}

export function doSimSettings(objectFrequency, settings) {
    let present = [];
    present = presentCounter(objectFrequency);

    if (settings == undefined) {
        settings = [""];
    }
    if (settings[0].state == true && isFinite(settings[0].stateValue)) {
        let presentState = [];
        let val = settings[0].stateValue

        present.forEach((item, index) => {
            if (item != '🎉CTF') {
                presentState[index] = item - val;
            } else {
                presentState[index] = item
            }
        });

        objectFrequency.forEach((item, index) => item.present = presentState[index]);
        console.log("smolk", objectFrequency)
    } else {
        objectFrequency.forEach((item, index) => item.present = present[index]);
    }

    document.getElementById("frequencyTable").innerHTML = simCreateTable(objectFrequency);


    //Tylko ta linia jest zmieniona REFAKTORYZUJ TO!!!!
    if (settings[0].hide == true) {
        let arraylessonToHide = [];
        settings[0].lessonToHide.forEach((item, index) => arraylessonToHide[index] = item);
        arraylessonToHide.forEach((item, index) => {
            if (document.querySelector(`tr[name="${item}"]`) != null) {
                document.querySelector(`tr[name="${item}"]`).style.display = "none"
            }
        });
    }

    //Pobieranie wartosci z inputów 
    let selectorLessPerWeek = document.querySelectorAll('.lessPerWeek');
    let selectorFrequency = document.querySelectorAll('.frequency');
    objectFrequency.forEach((item, index) => {
        selectorLessPerWeek[index].value = Math.round(item.lessPerWeek * 10 / 10);
        selectorFrequency[index].value = Math.round(item.frequency * 10 / 10);
    });

    if (settings[0].hightlight == true) {
        let presentSelector = document.querySelectorAll(".present");
        objectFrequency.forEach((item, index) => colorPresent(presentSelector, item, index));
    } else {
        let presentSelector = document.querySelectorAll(".present");
        objectFrequency.forEach((item, index) => presentSelector[index].innerHTML = `${item.present}%`);
    }
}
