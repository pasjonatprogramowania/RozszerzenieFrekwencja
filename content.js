if (
    window.location.href === "https://synergia.librus.pl/przegladaj_oceny/uczen"
) {
    //Wybiera on 2 komurke z kazdego wiersza bo znajduje sie tam nazwa przedmiotu
    const lessonSelector = document.querySelectorAll(`
    tbody:nth-child(2) .line0:not([name="przedmioty_all"]) td:not(.center):nth-child(2),
    tbody:nth-child(2) .line1:not([name="przedmioty_all"]) td:not(.center):nth-child(2)
    `);
    lessonText = [];

    lessonSelector.forEach((item, index) => (lessonText[index] = item.innerHTML));
    //Pobieramy index Zachowania poniewaz podczas pobierania lessonSelcet pobieraja sie tez smieci
    const lessonIndex = lessonText.findIndex(element =>
        element.includes("Zachowanie")
    );
    lessonText = lessonText.filter(element => lessonText.splice(lessonIndex));

    lessonText.forEach((item, index) => {
        if (item.includes("<")) {
            item = item.replace(/<\s*[^>]*>.*/gi, "");
            lessonText[index] = item;
        }
    });
    localStorage.setItem("lessonText", JSON.stringify(lessonText));
    //    //console.log(JSON.parse(localStorage.getItem("lessonText")));
}
if (window.location.href === "https://synergia.librus.pl/przegladaj_nb/uczen") {

    const frequencySelector = document.querySelectorAll(".ocena");
    let frequencyTitle = [];
    let localStorageLessonText = JSON.parse(localStorage.getItem("lessonText"));

    frequencySelector.forEach(
        (item, index) => (frequencyTitle[index] = item.getAttribute("title"))
    );

    //filter usuwa spóź i zwol nadajac im false (innym true) a potem zostawia tylko warunki z true
    frequencyTitle = frequencyTitle.filter(
        value =>
            value.match(/(zwolnienie|spóźnienie|wycieczka: tak)+/gm) > -1 == true
    );

    //Wybierz podsumowanie podsumowanie usprawiedliwionnej frekwencji
    let usprSelector = [];
    document
        .querySelectorAll(`tbody tr td:nth-child(3) strong`)
        .forEach(
            (item, index) => (usprSelector[index] = parseFloat(item.innerText))
        );

    //Wybierz podsumowanie podsumowanie nieusprawiedliwionnej frekwencji
    let nieUsprSelector = [];
    document
        .querySelectorAll(`tbody tr td:nth-child(4) strong`)
        .forEach(
            (item, index) => (nieUsprSelector[index] = parseFloat(item.innerText))
        );

    //Dodaj do sb te wartosci
    let semestrFrequencyCounter = [];
    usprSelector.forEach(
        (item, index) =>
            (semestrFrequencyCounter[index] = item + nieUsprSelector[index])
    );

    //Funkce
    let firstSemestrTitle = [];
    firstSemestrTitle = sliceSemestrFrequency(
        frequencyTitle,
        semestrFrequencyCounter[0],
        frequencyTitle.length
    );

    let secondSemestrTitle = [];
    secondSemestrTitle = sliceSemestrFrequency(
        frequencyTitle,
        0,
        semestrFrequencyCounter[0]
    );

    //sanityzacja frekwencji rocznej
    let yearFrequency = [];
    yearFrequency = sanitization(frequencyTitle, localStorageLessonText);

    //sanityzacja frekwencji pierwszy semestr
    let firstSemestrFrequency = [];
    firstSemestrFrequency = sanitization(
        firstSemestrTitle,
        localStorageLessonText
    );

    //sanityzacja frekwencji drógi semestr
    let secondSemestrFrequency = [];
    secondSemestrFrequency = sanitization(
        secondSemestrTitle,
        localStorageLessonText
    );

    let today = new Date();
    let day = String(today.getDate()).padStart(2, "0");
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let year = today.getFullYear();
    let lastOpenDate = `${day}.${month}.${year}`;

    let yearObjectFrequency = [];
    let firstObjectFrequency = [];
    let secondObjectFrequency = [];
    let simObjectFrequency = [];
    for (i = 0; i < localStorageLessonText.length; i++) {
        yearObjectFrequency.push({
            lastOpenDate: lastOpenDate,
            lessonName: localStorageLessonText[i],
            frequency: yearFrequency[i],
            lessPerWeek: 1,
            present: 1,
            type: "y",
            week: 37
        });
        firstObjectFrequency.push({
            lastOpenDate: lastOpenDate,
            lessonName: localStorageLessonText[i],
            frequency: firstSemestrFrequency[i],
            lessPerWeek: 1,
            present: 1,
            type: "f",
            week: 20
        });
        secondObjectFrequency.push({
            lastOpenDate: lastOpenDate,
            lessonName: localStorageLessonText[i],
            frequency: secondSemestrFrequency[i],
            lessPerWeek: 1,
            present: 1,
            type: "s",
            week: 17
        });
    }
    simObjectFrequency.push({
        lastOpenDate: lastOpenDate,
        lessonName: localStorageLessonText[i],
        frequency: 0,
        lessPerWeek: 1,
        present: 1,
        type: "sim",
        week: 37
    });

    chrome.runtime.sendMessage(yearObjectFrequency);
    chrome.runtime.sendMessage(firstObjectFrequency);
    chrome.runtime.sendMessage(secondObjectFrequency);
    chrome.runtime.sendMessage(simObjectFrequency);
}

function sliceSemestrFrequency(freq, start, end) {
    let slideFrequency = [];
    slideFrequency = freq.slice(start, end);
    return slideFrequency;
}

function sanitization(freq, text) {
    let allLesson = freq.join(" ").split(/\s?\.?<\/?\w?>?<?\w+\/?>\s?|\:\s?/gm);
    let frequencyCounter = text.map(word =>
        allLesson.reduce((acc, value) => (acc += value === word), 0)
    );
    return frequencyCounter;
}

/*To Do
-Przenies skrypt do bgscript i ustaw event na oczekiwanie strony z ocenami przed wysłaniem lessonsText do localStorage
*/

/*
Tabela = document.GetElementsByTagName('TBODY')[5]
pierwsze dziecko (wszystkie przedmioty) (tr) = Tabela.children
Drugie dziecko (wszystkie oceny z przedmiotu) (td) = Tabela.children.children
(ocena zamknięta w spanie) (span) = Tabela.children.children.children
(ocena) (a) = Tabela.children.children.children
*/
if (
    window.location.href === "https://synergia.librus.pl/przegladaj_oceny/uczen"
) {
    try {

        let sellectAllTd = document.querySelectorAll("td");
        sellectAllTd.forEach((item, index) => {
            item.style = "padding:0px 5px 0px 5px;";
        });
        let firstSemestr = [];
        let secondSemestr = [];
        let firstSemestrSelector = document.querySelectorAll(`
    tbody:nth-child(2) > tr[style="height: 26px;"] > td:not(.right):nth-child(3),
    tbody:nth-child(2) > tr[style="height: 26px;"] > td:not(.right):nth-child(3)
    `);
        let secondSemestrSelector = document.querySelectorAll(`
    tbody:nth-child(2) .line0:not([name="przedmioty_all"]) td:not(.right):nth-child(7),
    tbody:nth-child(2) .line1:not([name="przedmioty_all"]) td:not(.right):nth-child(7)
    `);
        firstSemestrSelector.forEach(
            (item, index) => (firstSemestr[index] = item.innerText)
        );
        secondSemestrSelector.forEach(
            (item, index) => (secondSemestr[index] = item.innerText)
        );

        // //console.log("aaaa", firstSemestrSelector);
        // //console.log("secondSemestrSelector", secondSemestrSelector);

        let arrayTitleRowIndex = [];

        let rowTitleSelector = document.querySelectorAll(
            `table > thead > tr:nth-child(2) td`
        );

        let librusIsFucked = document.querySelectorAll("#body > form:nth-child(5) > div > div > table > thead > tr:nth-child(2) > td");
        for (let i = 0; i < rowTitleSelector.length; i++) {
            if (rowTitleSelector[i].innerHTML.trim() == "Oceny bieżące") {
                arrayTitleRowIndex[i] = i + 2;
            } else if (rowTitleSelector[i].innerHTML.trim() == "Śr.I") {
                arrayTitleRowIndex[i] = i + 2;
            } else if (rowTitleSelector[i].innerHTML.trim() == "Śr.II") {
                arrayTitleRowIndex[i] = i + 2;
            } else if (rowTitleSelector[i].innerHTML.trim() == "Śr.R") {
                if (librusIsFucked.length == 8) {
                    arrayTitleRowIndex[i] = i - 8;
                } else if (librusIsFucked.length == 10) {
                    arrayTitleRowIndex[i] = i - 10;
                } else if (librusIsFucked.length == 11) {
                    arrayTitleRowIndex[i] = i - 11;
                }
            } else {
                arrayTitleRowIndex[i] = 0;
            }

        }
        console.log('librusIsFucked', librusIsFucked)

        console.log('a', librusIsFucked)
        let dummy = arrayTitleRowIndex.filter(function (el) {
            return el != 0;
        });
        let tabela = {
            p_oceny: dummy[0],
            p_srednia: dummy[1],
            d_oceny: dummy[2],
            d_srednia: dummy[3],
            srednia_rok: dummy[4]
        };

        var adres = window.location.href;
        if (adres.indexOf("przegladaj_oceny/uczen") != -1) {
            function check(number) {
                var flag = akoceny.indexOf(number);
                return flag;
            }

            function semestr(j, p) {
                // //console.log("j", j);
                // //console.log("p", p);

                //Tabela[5] = Tabelka frekwencja
                var Tabela = document.getElementsByTagName("TBODY");
                // //console.log("Tabela", Tabela);
                for (var h = 0; h < Tabela[5].children.length - 3; h++) {
                    //Tabela[5].children[h] = selector Tr
                    var nazwa = Tabela[5].children[h].hasAttribute("name");
                    //   //console.log("nazwa", nazwa);
                    //   //console.log("Tabela[5].children[h]", Tabela[5].children[h]);
                    /*selector nazwa ma wybrac tylko glowne wiersze w librusie*/
                    if (nazwa != true) {
                        Tabela[5].children[h].style.height = "26px";
                        var czybrakocen;
                        czybrakocen = Tabela[5].children[h].children[j].innerHTML;
                        if (czybrakocen != "Brak ocen") {
                            var flaga = false;
                            var sumawag = 0;
                            var sumaocen = 0;
                            var srednia = 0;
                            //Tabela[5].children[h].children[j].children.length = ilosc ocen
                            for (
                                var g = 0; g < Tabela[5].children[h].children[j].children.length; g++
                            ) {
                                // //console.log(
                                //   "Tabela[5].children[h].children[j].children.length",
                                //   Tabela[5].children[h].children[j].children.length
                                // );
                                var czynnik = null;
                                var czypoprawiana = Tabela[5].children[h].children[j].children[
                                    g
                                ].getAttribute("class");
                                //grade-box selecotr pierwszej oceny w klamrach
                                if (czypoprawiana == "grade-box") {
                                    // zawartoscoceny = wszystkie oceny
                                    var zawartoscoceny =
                                        Tabela[5].children[h].children[j].children[g].children[0]
                                            .textContent;
                                    ////console.log("zawartoscoceny", zawartoscoceny);
                                    if (check(zawartoscoceny) != "-1") {
                                        var flaga = true;
                                        var ocena =
                                            Tabela[5].children[h].children[j].children[g].children[0]
                                                .textContent;
                                        var tytul = Tabela[5].children[h].children[j].children[
                                            g
                                        ].children[0].getAttribute("title");
                                        var miejscewaga = tytul.indexOf("Waga: ") + 6;
                                        //indexPoczatkuTytułu
                                        // //console.log("miejscewaga", miejscewaga);
                                        var koniecwagi = tytul.indexOf("<br>", miejscewaga);
                                        //indexKoncaTytułu
                                        // //console.log("koniecwagi", koniecwagi);
                                        if (miejscewaga == 5) {
                                            var waga = 1;
                                        } else {
                                            var waga = parseInt(
                                                tytul.substr(miejscewaga, koniecwagi - miejscewaga)
                                            );
                                        }
                                        var miejscelicz = tytul.indexOf("średniej: ") + 10;
                                        var licz = tytul.substr(miejscelicz, 3);
                                        if (ocena.length > 1) {
                                            var czynnik = ocena.substr(1, 1);
                                            var ocena = ocena.substr(0, 1);
                                            if (czynnik == "-") {
                                                var ocena = parseFloat(ocena) - parseFloat(0.25);
                                            }
                                            if (czynnik == "+") {
                                                var ocena = parseFloat(ocena) + parseFloat(0.5);
                                            }
                                        }
                                        if (licz == "tak") {
                                            //.log("ocena: " + ocena);
                                            ////console.log("waga: " + waga);
                                            var sumaocen = sumaocen + ocena * waga;
                                            var sumawag = sumawag + waga;
                                        }
                                    }
                                } else {
                                    window.semestrAverage = [];
                                    for (
                                        var d = 0; d <
                                        Tabela[5].children[h].children[j].children[g].children.length; d++
                                    ) {
                                        var zawartoscoceny =
                                            Tabela[5].children[h].children[j].children[g].children[d]
                                                .children[0].textContent;
                                        if (check(zawartoscoceny) != "-1") {
                                            var flaga = true;
                                            var ocena = zawartoscoceny;
                                            var tytul = Tabela[5].children[h].children[j].children[
                                                g
                                            ].children[d].children[0].getAttribute("title");
                                            var miejscewaga = tytul.indexOf("Waga: ") + 6;
                                            var koniecwagi = tytul.indexOf("<br>", miejscewaga);
                                            if (miejscewaga == 5) {
                                                var waga = 1;
                                            } else {
                                                var waga = parseInt(
                                                    tytul.substr(miejscewaga, koniecwagi - miejscewaga)
                                                );
                                            }
                                            var miejscelicz = tytul.indexOf("średniej: ") + 10;
                                            var licz = tytul.substr(miejscelicz, 3);
                                            if (ocena.length > 1) {
                                                var czynnik = ocena.substr(1, 1);
                                                var ocena = ocena.substr(0, 1);
                                                if (czynnik == "-") {
                                                    var ocena = parseFloat(ocena) - parseFloat(0.25);
                                                }
                                                if (czynnik == "+") {
                                                    var ocena = parseFloat(ocena) + parseFloat(0.5);
                                                }
                                            }
                                            if (licz == "tak") {
                                                ////console.log("ocena: " + ocena);
                                                ////console.log("waga: " + waga);
                                                var sumaocen = sumaocen + ocena * waga;
                                                var sumawag = sumawag + waga;
                                            }
                                        }
                                    }
                                }
                            }
                            if (flaga == true) {
                                var srednia = sumaocen / sumawag;
                                Tabela[5].children[h].children[p].className = "center";
                                Tabela[5].children[h].children[p].innerHTML =
                                    Math.round(srednia * 100) / 100;
                                Tabela[5].children[h].children[p].setAttribute(
                                    "sumaocen",
                                    sumaocen
                                );
                                Tabela[5].children[h].children[p].setAttribute(
                                    "sumawag",
                                    sumawag
                                );
                                Tabela[5].children[h].children[p].setAttribute(
                                    "title",
                                    "Suma ocen: " + sumaocen + "\nSuma wag: " + sumawag
                                );
                            } else {
                                Tabela[5].children[h].children[p].className = "center";
                                Tabela[5].children[h].children[p].innerHTML = "-";
                            }
                        } else {
                            Tabela[5].children[h].children[p].className = "center";
                            Tabela[5].children[h].children[p].innerHTML = "-";
                        }
                    }
                }
            }

            function rok() {
                var Tabela = document.getElementsByTagName("TBODY");
                window.yearAverage = [];
                for (var h = 0; h < Tabela[5].children.length - 3; h++) {
                    var nazwa = Tabela[5].children[h].hasAttribute("name");
                    if (nazwa != true) {
                        var handler = Tabela[5].children[h].children[3];
                        var czysrednia = handler.hasAttribute("sumaocen");
                        var handler1 = Tabela[5].children[h].children[7];
                        var czysrednia1 = handler1.hasAttribute("sumaocen");
                        if ((czysrednia = true) || (czysrednia1 = true)) {
                            var sumaocen1 = handler.getAttribute("sumaocen");
                            var sumaocen2 = handler1.getAttribute("sumaocen");
                            var sumawag1 = handler.getAttribute("sumawag");
                            var sumawag2 = handler1.getAttribute("sumawag");
                            if (sumaocen1 == null) {
                                var sumaocen1 = 0;
                            }
                            if (sumawag1 == null) {
                                var sumawag1 = 0;
                            }
                            if (sumaocen2 == null) {
                                var sumaocen2 = 0;
                            }
                            if (sumawag2 == null) {
                                var sumawag2 = 0;
                            }
                            var sumaocenrok = parseFloat(sumaocen1) + parseFloat(sumaocen2);
                            var sumawagrok = parseFloat(sumawag1) + parseFloat(sumawag2);
                            ////console.log(sumaocen1 + "|" + sumaocen2 + "|" + sumawag1 + "|" + sumawag2 + "|" + sumaocenrok + "|" + sumawagrok);
                            var sredniarok = parseFloat(sumaocenrok) / parseFloat(sumawagrok);
                            // for (let i = 0; i < Tabela[5].children.length; i++) {
                            //     // Tabela[5].children[h].children[i]
                            //     //console.log('Tabela[5].children[h].children[i]', Tabela[5].children[h].children[i])
                            //     //console.log('tabela.srednia_rok', tabela)
                            // }
                            Tabela[5].children[h].children[
                                Tabela[5].children[h].children.length + tabela.srednia_rok
                            ].className = "center";
                            Tabela[5].children[h].children[
                                Tabela[5].children[h].children.length + tabela.srednia_rok
                            ].innerHTML = Math.round(sredniarok * 100) / 100;
                            Tabela[5].children[h].children[
                                Tabela[5].children[h].children.length + tabela.srednia_rok
                            ].setAttribute("sumaocenrok", sumaocenrok);
                            Tabela[5].children[h].children[
                                Tabela[5].children[h].children.length + tabela.srednia_rok
                            ].setAttribute("sumawagrok", sumawagrok);
                            Tabela[5].children[h].children[
                                Tabela[5].children[h].children.length + tabela.srednia_rok
                            ].setAttribute(
                                "title",
                                "Suma ocen: " + sumaocenrok + "\nSuma wag: " + sumawagrok
                            );
                            var czynan =
                                Tabela[5].children[h].children[
                                    Tabela[5].children[h].children.length + tabela.srednia_rok
                                ].innerHTML;
                            if (czynan == "NaN") {
                                Tabela[5].children[h].children[
                                    Tabela[5].children[h].children.length + tabela.srednia_rok
                                ].innerHTML = "-";
                            }
                        }
                    }
                }
            }
            var akoceny = [
                "1",
                "1-",
                "1+",
                "2",
                "2+",
                "2-",
                "3",
                "3-",
                "3+",
                "4",
                "4-",
                "4+",
                "5",
                "5-",
                "5+",
                "6"
            ];
            var element = document.createElement("tr");
            var element1 = document.createElement("td");
            element1.name = "podpis";
            element1.colSpan = "12";
            element1.className = "center";
            element1.style.background = "#dbdbdb";
            element1.innerHTML =
                "Średnia oraz Frekwencja obliczona dzięki oprogramowaniu Dominika Szpilskiego i Pawła Szewczyka";
            document.getElementsByTagName("TBODY")[5].appendChild(element);
            element.appendChild(element1);
            semestr(tabela.p_oceny, tabela.p_srednia);
            semestr(tabela.d_oceny, tabela.d_srednia);
            rok();
        }
        if (adres.indexOf("przegladaj_oceny/uczen") != -1) {
            // DODAWANIE SZABLONÓW CSS
            var css =
                ".libsr_button:hover{border-bottom: 2px solid #26a69a!important; cursor: pointer;}";
            var css_holder = document.createElement("style");
            css_holder.type = "text/css";
            css_holder.appendChild(document.createTextNode(css));
            document.getElementsByTagName("head")[0].appendChild(css_holder);
            // PRZYCISKI
            var elements =
                '<button id="libsr_reloadAVG" class="libsr_button" style="float: left;background-color: #4db6ac;outline: none;border: none;border-bottom: 5px solid #26a69a;color: white;font-weight: bold;margin: 0px; width: 120px; height:32px;">Przelicz średnią</button>' +
                '<button id="libsr_menu_button" class="libsr_button" style="float: left;background-color: #4db6ac;outline: none;border: none;border-bottom: 5px solid #26a69a;color: white;font-weight: bold;width: 200px;margin: 0px; height:32px;">Pokaż menu dodawania ocen</button>';
            var libsr_button_holder = document.createElement("div");
            libsr_button_holder.id = "libsr_button_holder";
            libsr_button_holder.style.position = "fixed";
            libsr_button_holder.style.top = "0px";
            libsr_button_holder.style.right = "40%";
            libsr_button_holder.style.zIndex = "10000";
            libsr_button_holder.style.width = "320px";
            libsr_button_holder.innerHTML += elements;
            document.body.appendChild(libsr_button_holder);
            //MENU DODAWANIA OCEN
            var libsr_menu_holder = document.createElement("div");
            libsr_menu_holder.id = "libsr_menu";
            libsr_menu_holder.style.width = "320px";
            libsr_menu_holder.style.position = "fixed";
            libsr_menu_holder.style.top = "40px";
            libsr_menu_holder.style.right = "20px";
            libsr_menu_holder.style.zIndex = "10000";
            libsr_menu_holder.style.backgroundColor = "white";
            libsr_menu_holder.style.display = "none";
            var oceny_options = "";
            for (var i = akoceny.length - 1; i >= 0; i--) {
                oceny_options +=
                    '<option value="' + akoceny[i] + '">' + akoceny[i] + "</option>";
            }
            var przedmioty_options = "";
            var Tabela = document.getElementsByTagName("TBODY");
            var optionNr = 0;
            for (var h = 0; h < Tabela[5].children.length - 3; h++) {
                var nazwa = Tabela[5].children[h].hasAttribute("name");
                if (nazwa != true) {
                    var przedmiot = Tabela[5].children[h].children[1].innerHTML;
                    przedmioty_options +=
                        '<option value="' + h + '">' + przedmiot + "</option>";
                }
            }
            var menu =
                '<h3 style="margin: 0;text-align: center;color: white;font-weight: bold;background-color: #26a69a!important;border-bottom: 5px solid #26a69a;background-color: white;">Dodawanie testowych ocen</h3>' +
                '<div style="margin: auto;width: 170px;text-align: center;">' +
                "<h4>Wybierz Semestr</h4>" +
                '<select id="libsr_semestr" name="semestr">' +
                '<option value="1">Semestr 1</option><option value="2">Semestr 2</option>' +
                "</select>" +
                "<h4>Wybierz Przedmiot</h4>" +
                '<select id="libsr_przedmiot" name="przedmiot">' +
                przedmioty_options +
                "</select>" +
                "<h4>Wybierz Ocenę</h4>" +
                '<select id="libsr_ocena" name="ocena">' +
                oceny_options +
                "</select>" +
                "<h4>Podaj Wagę</h4>" +
                '<input id="libsr_waga" type="text" name="waga"/>' +
                "</div>" +
                '<button id="libsr_addGrade" class="libsr_button" style="background-color: #26a69a;outline: none;border: none;border-bottom: 5px solid #26a69a;color: white;font-weight: bold;width: 100%;margin: 0px;margin-top: 20px;">Dodaj Ocenę</button>';
            libsr_menu_holder.innerHTML += menu;
            document.body.appendChild(libsr_menu_holder);
            /*EventListeners*/
            var button1 = document.getElementById("libsr_addGrade");
            button1.addEventListener("click", addGrade, false);
            var button2 = document.getElementById("libsr_menu_button");
            button2.addEventListener("click", toggleMenu, false);
            var button1 = document.getElementById("libsr_reloadAVG");
            button1.addEventListener("click", reloadAVG, false);

            function addGrade() {
                let semestr = document.getElementById("libsr_semestr").options[
                    document.getElementById("libsr_semestr").selectedIndex
                ].value;
                let przedmiot = document.getElementById("libsr_przedmiot").options[
                    document.getElementById("libsr_przedmiot").selectedIndex
                ].value;
                let ocena = document.getElementById("libsr_ocena").options[
                    document.getElementById("libsr_ocena").selectedIndex
                ].value;
                let waga = document.getElementById("libsr_waga").value;
                //console.log(" " + semestr + " " + przedmiot + " " + ocena + " " + waga);
                let nrKolumnyOcen = 2;
                if (semestr == 1) {
                    nrKolumnyOcen = tabela.p_oceny;
                } else {
                    nrKolumnyOcen = tabela.d_oceny;
                }
                let spanOcena = document.createElement("span");
                spanOcena.className = "grade-box";
                spanOcena.style.backgroundColor = "#26a69a";
                spanOcena.style.cursor = "pointer";
                spanOcena.addEventListener("click", deleteGrade, false);
                let aOcena = document.createElement("a");
                aOcena.title =
                    "Licz do średniej: tak<br>Waga: " +
                    waga +
                    "<br>Dodano za pomocą rozszerzenia Librus Oświata w Radomiu";
                aOcena.className = "ocena";
                aOcena.innerHTML = ocena;
                aOcena.addEventListener("click", deleteGrade, false);
                spanOcena.appendChild(aOcena);
                if (
                    Tabela[5].children[przedmiot].children[nrKolumnyOcen].innerHTML ==
                    "Brak ocen"
                ) {
                    Tabela[5].children[przedmiot].children[nrKolumnyOcen].innerHTML = "";
                }
                Tabela[5].children[przedmiot].children[nrKolumnyOcen].appendChild(
                    spanOcena
                );
            }

            function toggleMenu() {
                if (document.getElementById("libsr_menu").style.display == "none") {
                    document.getElementById("libsr_menu").style.display = "inline-block";
                    document.getElementById("libsr_menu_button").innerHTML =
                        "Ukryj menu dodawania ocen";
                } else {
                    document.getElementById("libsr_menu").style.display = "none";
                    document.getElementById("libsr_menu_button").innerHTML =
                        "Pokaż menu dodawania ocen";
                }
            }

            function reloadAVG() {
                semestr(tabela.p_oceny, tabela.p_srednia);
                semestr(tabela.d_oceny, tabela.d_srednia);
                rok();
            }

            function deleteGrade(evt) {
                if (evt.target.parentNode.className == "grade-box") {
                    evt.target.parentNode.remove();
                } else {
                    evt.target.remove();
                }
            }
        }

        let localStorageLessonText = JSON.parse(localStorage.getItem("lessonText"));

        let firstSemestrAverageSelector = document.querySelectorAll(
            `form:nth-child(5) > div > div > table > tbody > .line0:not([name="przedmioty_all"]) > td:nth-child(4),
    form:nth-child(5) > div > div > table > tbody > .line1:not([name="przedmioty_all"]) > td:nth-child(4)`
        );
        console.log('firstSemestrAverageSelector', firstSemestrAverageSelector)

        let secondSemestrAverageSelector
        if (librusIsFucked.length == 8) {
            secondSemestrAverageSelector = document.querySelectorAll(
                `form:nth-child(5) > div > div > table > tbody > .line0:not([name="przedmioty_all"]) > td:nth-child(7),
    form:nth-child(5) > div > div > table > tbody > .line1:not([name="przedmioty_all"]) > td:nth-child(7)`
            );
        } else {
            secondSemestrAverageSelector = document.querySelectorAll(
                `form:nth-child(5) > div > div > table > tbody > .line0:not([name="przedmioty_all"]) > td:nth-child(8),
    form:nth-child(5) > div > div > table > tbody > .line1:not([name="przedmioty_all"]) > td:nth-child(8)`
            );
        }
        console.log('secondSemestrAverageSelector', secondSemestrAverageSelector)

        let yearAverageSelector;
        if (librusIsFucked.length == 8) {
            yearAverageSelector = document.querySelectorAll(`#body > form:nth-child(5) > div > div > table > tbody > tr > td:nth-child(9)`);
        } else if (librusIsFucked.length == 10) {
            yearAverageSelector = document.querySelectorAll(`#body > form:nth-child(5) > div > div > table > tbody > tr > td:nth-child(10)`);
        } else if (librusIsFucked.length == 11) {
            yearAverageSelector = document.querySelectorAll(`#body > form:nth-child(5) > div > div > table > tbody > tr > td:nth-child(11)`);
        }
        console.log('yearAverageSelector', yearAverageSelector)

        let firstSemestrAverage = [];
        let secondSemestrAverage = [];
        let yearAverage = [];

        firstSemestrAverageSelector.forEach(
            (item, index) => (firstSemestrAverage[index] = parseFloat(item.innerText))
        );
        firstSemestrAverage.pop();

        secondSemestrAverageSelector.forEach(
            (item, index) => (secondSemestrAverage[index] = parseFloat(item.innerText))
        );

        yearAverageSelector.forEach(
            (item, index) => (yearAverage[index] = parseFloat(item.innerText))
        );

        let today = new Date();
        let day = String(today.getDate()).padStart(2, "0");
        let month = String(today.getMonth() + 1).padStart(2, "0");
        let year = today.getFullYear();
        let lastOpenDate = `${day}.${month}.${year}`;

        let averageObject = [];
        for (i = 0; i < localStorageLessonText.length; i++) {
            averageObject.push({
                lessonName: localStorageLessonText[i],
                firstSemestr: firstSemestrAverage[i],
                secondSemestr: secondSemestrAverage[i],
                year: yearAverage[i],
                lastOpenDate: lastOpenDate,
                type: "numbers"
            });
        }

        chrome.runtime.sendMessage(averageObject);

        let yearProviteMarkSelector;
        if (librusIsFucked.length == 8) {
            yearProviteMarkSelector = document.querySelectorAll("#body > form:nth-child(5) > div > div > table > tbody > tr > td:nth-child(9)");
        } else if (librusIsFucked.length == 10) {
            yearProviteMarkSelector = document.querySelectorAll(
                `form:nth-child(5) > div > div > table > tbody > .line0:not([name="przedmioty_all"]) > td:nth-child(12),
    form:nth-child(5) > div > div > table > tbody > .line1:not([name="przedmioty_all"]) > td:nth-child(11)`
            );
        } else if (librusIsFucked.length == 11) {
            yearProviteMarkSelector = document.querySelectorAll(
                `form:nth-child(5) > div > div > table > tbody > .line0:not([name="przedmioty_all"]) > td:nth-child(12),
    form:nth-child(5) > div > div > table > tbody > .line1:not([name="przedmioty_all"]) > td:nth-child(12)`
            );
        }
        console.log('yearProviteMarkSelector', yearProviteMarkSelector)

        let yearFinallMarkSelector;
        if (librusIsFucked.length == 8) {
            yearFinallMarkSelector = document.querySelectorAll("#body > form:nth-child(5) > div > div > table > tbody > tr > td:nth-child(10)");
        } else if (librusIsFucked.length == 10) {
            yearFinallMarkSelector = document.querySelectorAll("#body > form:nth-child(5) > div > div > table > tbody > tr > td:nth-child(11)");
        } else if (librusIsFucked.length == 11) {
            yearFinallMarkSelector = document.querySelectorAll(`#body > form:nth-child(5) > div > div > table > tbody > tr:not([name="przedmioty_all"]) > td:nth-child(13)`);
        }
        console.log('yearFinallMarkSelector', yearFinallMarkSelector)

        let yearProviteMark = [];
        let yearFinalMark = [];
        yearProviteMarkSelector.forEach((item, index) => {
            yearProviteMark[index] = item.innerHTML;
            yearProviteMark[index] = (yearProviteMark[index].replace(/<\s*[^>]*>[^><]*>?/g, "")).trim();
        });
        yearFinallMarkSelector.forEach((item, index) => {
            yearFinalMark[index] = item.innerHTML;
            yearFinalMark[index] = (yearFinalMark[index].replace(/<\s*[^>]*>[^><]*>?/g, "")).trim();
        });
        let yearAverageRounded = [];

        yearAverage.forEach((item, index) => {
            //console.log(item)
            if (yearFinalMark[index] != "-") {
                if (yearFinalMark[index] >= 6) {
                    yearAverageRounded[index] = 6;
                } else if (yearFinalMark[index] >= 5) {
                    yearAverageRounded[index] = 5;
                } else if (yearFinalMark[index] >= 4) {
                    yearAverageRounded[index] = 4;
                } else if (yearFinalMark[index] >= 3) {
                    yearAverageRounded[index] = 3;
                } else if (yearFinalMark[index] >= 2) {
                    yearAverageRounded[index] = 2;
                } else if (yearFinalMark[index] >= 1) {
                    yearAverageRounded[index] = 1;
                } else {
                    yearAverageRounded[index] = 0;
                }
            } else if (yearProviteMark[index] != "-") {
                if (yearProviteMark[index] >= 6) {
                    yearAverageRounded[index] = 6;
                } else if (yearProviteMark[index] >= 5) {
                    yearAverageRounded[index] = 5;
                } else if (yearProviteMark[index] >= 4) {
                    yearAverageRounded[index] = 4;
                } else if (yearProviteMark[index] >= 3) {
                    yearAverageRounded[index] = 3;
                } else if (yearProviteMark[index] >= 2) {
                    yearAverageRounded[index] = 2;
                } else if (yearProviteMark[index] >= 1) {
                    yearAverageRounded[index] = 1;
                } else {
                    yearAverageRounded[index] = 0;
                }
            } else {
                if (item >= 5.75 && isFinite(item)) {
                    yearAverageRounded[index] = 6;
                } else if (item >= 4.75 && isFinite(item)) {
                    yearAverageRounded[index] = 5;
                } else if (item >= 3.75 && isFinite(item)) {
                    yearAverageRounded[index] = 4;
                } else if (item >= 2.75 && isFinite(item)) {
                    yearAverageRounded[index] = 3;
                } else if (item >= 1.75 && isFinite(item)) {
                    yearAverageRounded[index] = 2;
                } else if (item >= 0.75 && isFinite(item)) {
                    yearAverageRounded[index] = 1;
                } else {
                    yearAverageRounded[index] = 0;
                }
            }
        });

        yearAverageRounded = yearAverageRounded.filter(function (el) {
            return el != 0;
        });
        console.log('yearAverageRounded', yearAverageRounded)

        let yearAverageRoundedSume = yearAverageRounded.reduce((previousValue, currentValue) => previousValue + currentValue);

        let yearAverageProvite = yearAverageRoundedSume / yearAverageRounded.length;
        //console.log('yearProviteAverage', yearAverageProvite);
        let proviteAverage = [];
        proviteAverage.push({
            yearAverageRounded: yearAverageRounded,
            yearAverageRoundedSume: yearAverageRoundedSume,
            yearAverageProvite: yearAverageProvite,
            lastOpenDate: lastOpenDate,
            type: "provite"
        });
        chrome.runtime.sendMessage(proviteAverage);

    } catch (err) {
        console.log(err);
    }
}