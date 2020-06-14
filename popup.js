export function presentCounter(objectFrequency) {
    let present = [];
    present = objectFrequency.map((v, i) =>
        Math.round(100 - (v.frequency / (v.lessPerWeek * v.week)) * 100)
    );
    present.forEach((item, index) => {
        if (!isFinite(item)) {
            present[index] = 100;
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
    return (document.querySelector(val).innerHTML += `
    <img src="error.png"> 
    <!-- Grafiak https://icons8.com/ouch/illustration/cherry-list-is-empty-1 -->`);
}

export function setup(backupObjectFrequency, objectFrequency, settings) {
    try {
        console.log("objectFrequency", objectFrequency);
        console.log("backupObjectFrequency", backupObjectFrequency);
        console.log("settings", settings);

        if (Array.isArray(objectFrequency)) {
            console.log("Nie musze wczytywac backupu");
        } else if (
            !Array.isArray(objectFrequency) &&
            backupObjectFrequency != undefined
        ) {
            console.log("Uwaga wczytuje backup");
            objectFrequency = backupObjectFrequency;
        } else {
            console.log("Nie znalazłem nic, dla bezpiecenstwa żucam wyjątkiem");
            throw new SyntaxError("Nie wykryto frekwencji");
        }
        console.log("objectFrequency", objectFrequency);

        displayDateWhenbackup(objectFrequency, settings);

        //Tworzenie Tabelki frekwencja
        doSettings(settings, objectFrequency);

        document
            .querySelector("div.center-align a")
            .addEventListener("click", () => saveChanges(objectFrequency, settings));
    } catch (error) {
        createSvg("#frequency");
        console.log(error);
    }
}

export function displayDateWhenbackup(objectFrequency, settings) {
    //Jesli frekwencja nie jest z tego dnia co powinna byc uzytkownik dostanie o tym informacje
    let today = new Date();
    let day = String(today.getDate()).padStart(2, "0");
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let year = today.getFullYear();
    let contentLastOpenDate = `${day}.${month}.${year}`;

    if (contentLastOpenDate != objectFrequency[0].lastOpenDate) {
        let selectorLastOpenDate = document.querySelector("#lastOpenDate");
        selectorLastOpenDate.style = "display:block";
        selectorLastOpenDate.innerHTML += `<div>Frekwencja z dnia: ${objectFrequency[0].lastOpenDate}</div>`;
    }
    if (settings == undefined) {
        settings = [""];
    }
    if (settings[0].state == true && isFinite(settings[0].stateValue)) {
        let selectorLastOpenDate = document.querySelector("#lastOpenDate");
        selectorLastOpenDate.style = "display:block";
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
        let val = settings[0].stateValue;
        present.forEach((item, index) => (presentState[index] = item - val));
        objectFrequency.forEach(
            (item, index) => (item.present = presentState[index])
        );
    } else {
        objectFrequency.forEach((item, index) => (item.present = present[index]));
    }

    document.getElementById("frequencyTable").innerHTML = createTable(
        objectFrequency
    );

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
    //Pobieranie wartosci z inputów
    let selectorLessPerWeek = document.querySelectorAll("input");

    objectFrequency.forEach((item, index) => {
        if (Math.abs(Math.round((item.lessPerWeek * 10) / 10)) > 60) {
            selectorLessPerWeek[index].value = 60;
        } else {
            selectorLessPerWeek[index].value = Math.abs(
                Math.round((item.lessPerWeek * 10) / 10)
            );
        }
    });

    if (settings[0].hightlight == true) {
        let presentSelector = document.querySelectorAll(".present");
        objectFrequency.forEach((item, index) =>
            colorPresent(presentSelector, item, index)
        );
    } else {
        let presentSelector = document.querySelectorAll(".present");

        objectFrequency.forEach(
            (item, index) => (presentSelector[index].innerHTML = `${item.present}%`)
        );
    }
}

export function saveChanges(objectFrequency, settings) {
    console.log("kliknołes przycisk");

    let selectorInput = document.querySelectorAll("input");

    objectFrequency.forEach((item, index) => {
        item.lessPerWeek = Math.abs(
            Math.round((selectorInput[index].value * 10) / 10)
        );
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
    doSettings(settings, objectFrequency);
}

export function colorPresent(presentSelector, item, index) {
    if (item.present > 0) {
        if (item.present >= 90) {
            presentSelector[
                index
            ].innerHTML = `<span class="green-text">${item.present}%</span>`;
        } else if (item.present >= 70) {
            presentSelector[
                index
            ].innerHTML = `<span class="light-green-text">${item.present}%</span>`;
        } else if (item.present >= 50) {
            presentSelector[
                index
            ].innerHTML = `<span class="amber-text">${item.present}%</span>`;
        } else if (item.present >= 30) {
            presentSelector[
                index
            ].innerHTML = `<span class="orange-text">${item.present}%</span>`;
        } else {
            presentSelector[
                index
            ].innerHTML = `<span class="red-text">${item.present}%</span>`;
        }
    } else {
        presentSelector[index].innerHTML = `<span class="red-text">1%</span>`;
    }
}
export function simSetup(backupObjectFrequency, objectFrequency, settings) {
    try {
        console.log("objectFrequency", objectFrequency);
        console.log("backupObjectFrequency", backupObjectFrequency);
        console.log("settings", settings);

        if (Array.isArray(objectFrequency)) {
            console.log("Nie musze wczytywac backupu");
        } else if (
            !Array.isArray(objectFrequency) &&
            backupObjectFrequency != undefined
        ) {
            console.log("Uwaga wczytuje backup");
            objectFrequency = backupObjectFrequency;
        } else {
            console.log("Nie znalazłem nic, dla bezpiecenstwa żucam wyjątkiem");
            throw new SyntaxError("Nie wykryto frekwencji");
        }

        displayDateWhenbackup(objectFrequency, settings);

        doSimSettings(objectFrequency, settings);

        document
            .querySelector("div.center-align a")
            .addEventListener("click", () =>
                saveSimChanges(objectFrequency, settings)
            );
    } catch (error) {
        createSvg("#frequency");
        console.log(error);
    }
}

export function simCreateTable(objectFrequency) {
    let dataHtml = "";
    dataHtml += `
        <tr>
            <td class="center-align lessonName" >Przedmiot symulacyjny</td>
            <td class="center-align flow-text">
                <input type="number" class="input-default-weight lessPerWeek" min="0" max="20" value="${objectFrequency[0].lessPerWeek}">
                <i id="hint-default-weight" class="material-icons tooltipped" data-position="top" data-delay="250" data-tooltip="Ilość lekcji w tygodniu">info_outline</i>
            </td>  
            <td class="center-align flow-text">
                <input type="number" class="input-default-weight frequency" min="0" max="30" value="${objectFrequency[0].frequency}">
                <i id="hint-default-weight" class="material-icons tooltipped" data-position="top" data-delay="250" data-tooltip="Nieobecne godziny">info_outline</i>
            </td>
            <td class="center-align flow-text present">${objectFrequency[0].pressent}%</td>
        </tr>`;
    return dataHtml;
}

export function saveSimChanges(objectFrequency, settings) {
    console.log("kliknołes przycisk");

    let selectorLessPerWeek = document.querySelectorAll(".lessPerWeek");
    let selectorFrequency = document.querySelectorAll(".frequency");

    objectFrequency.forEach((item, index) => {
        item.lessPerWeek = Math.abs(
            Math.round((selectorLessPerWeek[index].value * 10) / 10)
        );
        item.frequency = Math.abs(
            Math.round((selectorFrequency[index].value * 10) / 10)
        );
    });

    if (objectFrequency[0].type == "sim") {
        chrome.storage.local.set({
            simObjectFrequency: objectFrequency
        });
    }

    doSimSettings(objectFrequency, settings);
}

export function doSimSettings(objectFrequency, settings) {
    let present = [];
    present = presentCounter(objectFrequency);

    if (settings == undefined) {
        settings = [""];
    }
    if (settings[0].state == true && isFinite(settings[0].stateValue)) {
        let presentState = [];
        let val = settings[0].stateValue;

        present.forEach((item, index) => (presentState[index] = item - val));
        objectFrequency.forEach(
            (item, index) => (item.present = presentState[index])
        );
    } else {
        objectFrequency.forEach((item, index) => (item.present = present[index]));
    }

    document.getElementById("frequencyTable").innerHTML = simCreateTable(
        objectFrequency
    );

    //Tylko ta linia jest zmieniona REFAKTORYZUJ TO!!!!
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

    //Pobieranie wartosci z inputów
    let selectorLessPerWeek = document.querySelectorAll(".lessPerWeek");
    let selectorFrequency = document.querySelectorAll(".frequency");

    objectFrequency.forEach((item, index) => {
        if (Math.abs(Math.round((item.lessPerWeek * 10) / 10)) > 60) {
            selectorLessPerWeek[index].value = 60;
        } else {
            selectorLessPerWeek[index].value = Math.abs(
                Math.round((item.lessPerWeek * 10) / 10)
            );
        }
        if (Math.abs(Math.round((item.frequency * 10) / 10)) > 60) {
            selectorFrequency[index].value = 60;
        } else {
            selectorFrequency[index].value = Math.abs(
                Math.round((item.frequency * 10) / 10)
            );
        }
    });

    if (settings[0].hightlight == true) {
        let presentSelector = document.querySelectorAll(".present");
        objectFrequency.forEach((item, index) =>
            colorPresent(presentSelector, item, index)
        );
    } else {
        let presentSelector = document.querySelectorAll(".present");
        objectFrequency.forEach((item, index) => {
            console.log(item);
            if (item.present > 0) {
                presentSelector[index].innerHTML = `${item.present}%`;
            } else {
                presentSelector[index].innerHTML = `1%`;
            }
        });
    }
}
