import { createSvg } from "/popup.js";

document.addEventListener("laod", getBackupObjectFrequency());

function getBackupObjectFrequency() {
  let bgpage = chrome.extension.getBackgroundPage();
  let objectFrequency = bgpage.yearObjectFrequency;

  let promisFrequency = new Promise(resolve => {
    chrome.storage.local.get("yearObjectFrequency", result => {
      resolve(result["yearObjectFrequency"]);
    });
  });
  let promisSettings = new Promise(resolve => {
    chrome.storage.local.get("settings", result => {
      resolve(result["settings"]);
    });
  });
  let freqToLoad;
  promisFrequency.then(data => {
    freqToLoad = data;
  });
  let settToLoad;
  promisSettings
    .then(data => {
      settToLoad = data;
    })
    .then(() => {
      setSettings(freqToLoad, settToLoad);
    });
}

function setSettings(objectFrequency, settings) {
  console.log(settings);
  try {
    if (objectFrequency == undefined) {
      throw new SyntaxError("Nie wykryto frekwencji");
    }
    if (settings != undefined) {
      if (settings[0].sort == true) {
        document
          .querySelector('input[value="sort"]')
          .setAttribute("checked", "checked");
      }
      if (settings[0].hightlight == true) {
        document
          .querySelector('input[value="hightlight"]')
          .setAttribute("checked", "checked");
      }
      if (isFinite(settings[0].stateValue)) {
        document
          .querySelector('input[value="state"]')
          .setAttribute("checked", "checked");
        document.querySelector("#value").value = settings[0].stateValue;
      } else {
        settings[0].state = false;
        chrome.storage.local.set({
          settings: settings
        });
      }
    }
    document.querySelector("tbody").innerHTML = createTableSettings(
      objectFrequency
    );
    if (settings != undefined) {
      if (settings[0].hide == true && settings[0].lessonToHide.length != 0) {
        document
          .querySelector('input[value="hide"]')
          .setAttribute("checked", "checked");

        let arrayLessonToHide = [];
        settings[0].lessonToHide.forEach(
          (item, index) => (arrayLessonToHide[index] = item)
        );
        arrayLessonToHide.forEach((item, index) => {
          if (document.querySelector(`input[value="${item}"]`) != null) {
            document
              .querySelector(`input[value="${item}"]`)
              .setAttribute("checked", "checked");
          }
        });
      } else if (settings[0].lessonToHide.length == 0) {
        settings[0].hide = false;
        chrome.storage.local.set({
          settings: settings
        });
      }
    }
    document.querySelector("a.btn-large").addEventListener("click", function() {
      let checkboxValue = [];
      $("input:checked").each(function(i) {
        checkboxValue[i] = $(this).val();
      });
      saveSettings(checkboxValue, objectFrequency);
    });
  } catch (error) {
    console.log(error);
  }
}

function saveSettings(checkbox, objectFrequency) {
  console.log(checkbox);
  let stateValue;
  let lessonToHide = [];
  if (checkbox.includes("state")) {
    if (Math.abs(Math.round(document.querySelector("#value").value)) > 10) {
      stateValue = 10;
      document.querySelector("#value").value = stateValue;
    } else {
      stateValue = Math.abs(Math.round(document.querySelector("#value").value));
      document.querySelector("#value").value = stateValue;
    }
  }
  if (checkbox.includes("hide")) {
    let dummyLessonToHide = [];
    objectFrequency.forEach((item, index) => {
      if (checkbox.includes(item.lessonName)) {
        dummyLessonToHide[index] = item.lessonName;
      }
    });
    lessonToHide = dummyLessonToHide.filter(val => val != null);
    console.log(lessonToHide);
  }

  let settings = [];
  settings.push({
    sort: checkbox.includes("sort"),
    hightlight: checkbox.includes("hightlight"),
    hide: checkbox.includes("hide"),
    state: checkbox.includes("state"),
    stateValue: parseInt(stateValue),
    lessonToHide: lessonToHide
  });

  chrome.storage.local.set({
    settings: settings
  });
  console.log(settings);
}

function createTableSettings(objFreq) {
  let dataHtml = "";
  for (let i = 0; i < objFreq.length; i++) {
    dataHtml += `
        <tr>
            <td class="lessonName">
                <label class="black-text">
                    <input type="checkbox" name="lessonToHide" class="filled-in" value="${objFreq[i].lessonName}">
                    <span>${objFreq[i].lessonName}</span>
                </label>
            </td>
        </tr>`;
  }
  return dataHtml;
}

//Materilize css Navbar
document.addEventListener("DOMContentLoaded", function() {
  let elems = document.querySelectorAll(".sidenav");
  let instances = M.Sidenav.init(elems);
});
////Materialize css tooltip
$("document").ready(function() {
  let elems = document.querySelectorAll(".tooltipped");
  let instances = M.Tooltip.init(elems);
});

// Materialize css Toast
document.querySelector("a.btn-large").addEventListener("click", () => {
  M.toast({
    html: "Zmiany zosatły zapisane",
    classes: "toast-container",
    inDuration: 300,
    outDuration: 300
  });
});
