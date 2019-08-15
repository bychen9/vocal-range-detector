const audioContext = new AudioContext();

let mediaRecorder;
let sourceStream;
let refreshHandle;
let noteArray = [];

let body = document.querySelector("body");
let fileName = location.href.split("/").slice(-1);

let recordbutton = document.getElementById("recordbutton");
recordbutton.onclick = () => {
  getMedia();
  recordbutton.innerHTML = "Recording";
  recordbutton.disabled = true;
  if (fileName[0] != "first-step.html") {
      play.disabled = true;
  }
};

async function getMedia() {
  try {
    sourceStream = await navigator.mediaDevices.getUserMedia({audio: true});
    listen();
    let complete = document.getElementById("complete");
    if (complete != null) {
      complete.parentNode.removeChild(complete);
    }
    let yousang = document.getElementById("yousang");
    if (yousang != null) {
      yousang.parentNode.removeChild(yousang);
    }
  } catch(error) {
    console.log(error);
    alert("Please enable your microphone.");
    recordbutton.innerHTML = "Record";
    recordbutton.disabled = false;
    if (fileName[0] != "first-step.html") {
        play.disabled = false;
    }
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
      setTimeout(() => mediaRecorder.stop(), 500);
      }, 1000);
}

/**
 * Stops listening for audio.
 */
function stop () {
  clearInterval(refreshHandle);
  let text = document.createElement("p");
  let node = document.createTextNode("Recording Complete.");
  text.setAttribute("id", "complete");
  text.append(node);
  body.append(text);
  recordbutton.innerHTML = "Record";
  recordbutton.disabled = false;
  if (fileName[0] != "first-step.html") {
    play.disabled = false;
  }
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
      
      let noteToSing = document.getElementById("noteToSing");
      let goal = noteToSing.innerHTML.substring(17, noteToSing.innerHTML.length - 1);
      if (note === goal) {
        let node = document.createTextNode("Nice! You correctly sang " + note + ".");
        text.setAttribute("id", "yousang");
        text.append(node);
        body.append(text);
        pass();
      } else {
        let node = document.createTextNode("Oops! You sang " + note + " instead of " + goal + "."); 
        text.setAttribute("id", "yousang");
        text.append(node);
        body.append(text);
        fail();
      }
    }
  }
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
