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
  //    console.log(JSON.parse(localStorage.getItem("lessonText")));
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
