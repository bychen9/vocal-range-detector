/*
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = audioCtx.createOscillator();
oscillator.type = "sine";
oscillator.connect(audioCtx.destination);
oscillator.frequency.setValueAtTime(466.16, audioContext.currentTime);
oscillator.start();
oscillator.stop(audioCtx.currentTime + 2);
*/

/* global AudioContext:false, Event:false, Worker:false, MediaRecorder:false, fetch:false, URL:false */

const audioContext = new AudioContext();

let mediaRecorder;
let sourceStream;
let refreshHandle;
let noteArray = [];

let body = document.querySelector("body");
let fileName = location.href.split("/").slice(-1);

let recordbutton = document.getElementById("recordbutton");
recordbutton.onclick = getMedia;

async function getMedia() {
    try {
      sourceStream = await navigator.mediaDevices.getUserMedia({audio: true});
      listen();
    } catch(error) {
        console.log(error);
        alert("Please enable your microphone.");
    };
}

/**
 * Starts listening for audio.
 */
function listen () {
  mediaRecorder = new MediaRecorder(sourceStream);

  mediaRecorder.ondataavailable = update;

  // Every 500ms, send whatever has been recorded to the audio processor.
  // This can't be done with `mediaRecorder.start(ms)` because the
  // `AudioContext` may fail to decode the audio data when sent in parts.
  refreshHandle = setInterval(() => {
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 500)
  }, 1000);
 }

/**
 * Stops listening for audio.
 */
function stop () {
  clearInterval(refreshHandle);
  let text = document.createElement("p");
  let node = document.createTextNode("Recording Complete.");
  text.append(node);
  body.append(text);
}

/**
 * Handles data received from a `MediaRecorder`.
 * @param {BlobEvent} e Blob event from the `MediaRecorder`.
 */
async function update (e) {
  if (e.data.size !== 0) {
    await process(e.data);
  }
}

/**
 * Sends audio data to the audio processing worker.
 * @param {Blob} data The blob containing the recorded audio data.
 */
async function process (data) {
  // Load the blob.
  const response = await fetch(URL.createObjectURL(data));
  const arrayBuffer = await response.arrayBuffer();
  // Decode the audio.
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const audioData = audioBuffer.getChannelData(0);
  // Send the audio data to the audio processing worker.
  const sampleRate = audioBuffer.sampleRate;
  const pitch = analyseAudioData(sampleRate, audioData, accidentals = 'sharps');
  
  updateNoteArray(pitch);
  if (noteArray.length == 2) {
      stop(); 
      let note = noteArray[0];    
      if (fileName[0] == "first-step.html") {
            localStorage.setItem("baseNote", note);
            let text = document.createElement("p");
            let node = document.createTextNode("Your base note is " + note + ".");
            text.append(node);
            body.append(text);
            
            let button = document.createElement("BUTTON");
            button.innerHTML = "Next Step";
            button.setAttribute("onclick", "location.href = 'second-step.html'");
            body.append(button);
      } else {
            let text = document.createElement("p");
            let node = document.createTextNode("You sang " + note + ".");
            text.append(node);
            body.append(text);
            let noteToSing = document.getElementById("noteToSing");
            if (note === noteToSing.innerHTML.substring(17, noteToSing.innerHTML.length - 1)) {
                pass();
            } else {
                fail();
            }
        }
  }

  /*
  if (fileName[0] == "first-step.html") {
        localStorage.setItem("baseNote", note);
        let text = document.createElement("p");
        let node = document.createTextNode("Your base note is " + note + ".");
        text.append(node);
        body.append(text);
        
        let button = document.createElement("BUTTON");
        button.innerHTML = "Next Step";
        button.setAttribute("onclick", "location.href = 'second-step.html'");
        body.append(button);
  } else {
        let text = document.createElement("p");
        let node = document.createTextNode("You sang " + note + ".");
        text.append(node);
        body.append(text);
        let noteToSing = document.getElementById("noteToSing");
        if (note === noteToSing.innerHTML.substring(17, noteToSing.innerHTML.length - 1)) {
            pass();
        } else {
            fail();
        }
    }
    */
}

function updateNoteArray(pitch) {
    let previousNote;
    if (noteArray.length > 0) {
        previousNote = noteArray[noteArray.length-1];
    }
    if (pitch == null || pitch.octave > 9 || (pitch.key+pitch.octave != previousNote && previousNote != null)) {
        noteArray.length = 0;
    }
    else {
        noteArray.push(pitch.key+pitch.octave)
    }
}
