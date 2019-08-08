let fileName = location.href.split("/").slice(-1);
let base = localStorage.getItem('baseNote');
let body = document.querySelector("body");
let text = document.createElement("p");
let node = document.createTextNode("Your base note was " + base + ".");
text.append(node);
body.insertBefore(text, body.childNodes[3]);

let upNotes = ["A", "B", "C", "D", "E", "F", "G"];
let downNotes = ["G", "F", "E", "D", "C", "B", "A"];
let baseIndex;
if (fileName[0] == "second-step.html") {
    baseIndex = upNotes.findIndex(element => {
        return element === base.charAt(0);
    });
} else {
    baseIndex = downNotes.findIndex(element => {
        return element == base.charAt(0);
    });
}

let i = 1;
let octaveNumber = base.charAt(1);
let prevOctave = octaveNumber;
let note = base[0];
let prevNote = note;

function nextNote() {
    prevNote = note;
    if (fileName[0] == "second-step.html") {
        note = upNotes[(baseIndex + i) % 7];
        if (note === "A") {
            prevOctave = octaveNumber;
            octaveNumber++;
        }
    } else {
        note = downNotes[(baseIndex + i) % 7];
        if (note === "G") {
            prevOctave = octaveNumber;
            octaveNumber--;
        }
    }
    let singText = document.createElement("p");
    let sing = document.createTextNode("Now, try to sing " + note + octaveNumber + ".");
    singText.append(sing);
    singText.setAttribute("id", "noteToSing");
    body.insertBefore(singText, body.childNodes[4]);
    i++;
}
nextNote();

let pass = document.getElementById("pass");
pass.onclick = function() {
    let noteToSing = document.getElementById("noteToSing");
    if (noteToSing != null) {
        noteToSing.parentNode.removeChild(noteToSing);
    }
    nextNote(); 
}

let fail = document.getElementById("fail");
fail.onclick = function() {
    if (fileName[0] === "second-step.html") {
        localStorage.setItem('highNote', prevNote + prevOctave); 
        location.href = "third-step.html";
    } else {
        localStorage.setItem('lowNote', prevNote + prevOctave);
        location.href = "results.html";
    }
}
