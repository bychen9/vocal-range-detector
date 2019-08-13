let base = localStorage.getItem('baseNote');
let text = document.createElement("p");
let node = document.createTextNode("Your base note was " + base + ".");
text.append(node);
body.insertBefore(text, body.childNodes[3]);

let upNotes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
let downNotes = ["G#", "G", "F#", "F", "E", "D#", "D", "C#", "C", "B", "A#", "A"];
let baseIndex;
if (fileName[0] == "second-step.html") {
    baseIndex = upNotes.findIndex(element => {
        return element === base.substring(0, base.length - 1);
    });
} else {
    baseIndex = downNotes.findIndex(element => {
        return element == base.substring(0, base.length - 1);
    });
}

let i = 1;
let octaveNumber = base.charAt(base.length -1);
let prevOctave = octaveNumber;
let note = base.substring(0, base.length - 1);
let prevNote = note;

function nextNote() {
    prevNote = note;
    if (fileName[0] == "second-step.html") {
        note = upNotes[(baseIndex + i) % 12];
        if (note === "C") {
            octaveNumber++;
        } else if (note === "C#") {
            prevOctave = octaveNumber;
        }
    } else {
        note = downNotes[(baseIndex + i) % 12];
        if (note === "B") {
            octaveNumber--;
        } else if (note === "A#") {
            prevOctave = octaveNumber;
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

function pass() {
    let noteToSing = document.getElementById("noteToSing");
    if (noteToSing != null) {
        noteToSing.parentNode.removeChild(noteToSing);
    }
    nextNote();
}

function fail() {
    let next = document.createElement("BUTTON");
    next.innerHTML = "Next Step";

    let text = document.createElement("p");
    let node;

    if (fileName[0] === "second-step.html") {
        localStorage.setItem('highNote', prevNote + prevOctave);
        next.setAttribute("onclick", "location.href = 'third-step.html'");
        node = document.createTextNode("Your highest note is " + prevNote + prevOctave + ".");
    } else {
        localStorage.setItem('lowNote', prevNote + prevOctave);
        next.setAttribute("onclick", "location.href = 'results.html'");
        node = document.createTextNode("Your lowest note is " + prevNote + prevOctave + ".");
    }

    text.append(node);

    let tryagain = document.createElement("BUTTON");
    tryagain.innerHTML = "Try Again";
    tryagain.onclick = function() {
        tryagain.parentNode.removeChild(tryagain);
        if (next != null) {
            next.parentNode.removeChild(next);
        }
        if (text != null) {
            text.parentNode.removeChild(text);
        }
        recordbutton.disabled = false;
    }

    body.append(text);
    body.append(tryagain);
    body.append(next);

    recordbutton.disabled = true;
}
