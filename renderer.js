/*
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = audioCtx.createOscillator();
oscillator.type = "sine";
oscillator.connect(audioCtx.destination);
oscillator.frequency.setValueAtTime(466.16, audioContext.currentTime);
oscillator.start();
*/

/* global AudioContext:false, Event:false, Worker:false, MediaRecorder:false, fetch:false, URL:false */

const audioContext = new AudioContext();

let mediaRecorder;
let sourceStream;
let refreshHandle;

let body = document.querySelector("body");
let fileName = location.href.split("/").slice(-1);

async function getMedia() {
    try {
      sourceStream = await navigator.mediaDevices.getUserMedia({audio: true});
      listen();
      setTimeout(() => stop(), 2000);
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
  mediaRecorder.start();
 // setTimeout(() => mediaRecorder.stop(), 1000);

  // Every 200ms, send whatever has been recorded to the audio processor.
  // This can't be done with `mediaRecorder.start(ms)` because the
  // `AudioContext` may fail to decode the audio data when sent in parts.
  /*
  refreshHandle = setInterval(() => {
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 200)
  }, 200);
  */
 }

let recordbutton = document.getElementById("recordbutton");
recordbutton.onclick = getMedia;
/**
 * Stops listening for audio.
 */
function stop () {
  clearInterval(refreshHandle);
  mediaRecorder.stop();
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
  const pitch = analyseAudioData(440, sampleRate, audioData, accidentals = 'sharps');
  let baseNote = pitch.key + pitch.octave;
  console.log(baseNote);
  if (fileName[0] == "first-step.html") {
    localStorage.setItem('baseNote', baseNote);
    let text = document.createElement("p");
    let node = document.createTextNode("Your base note is " + baseNote + ".");
    text.append(node);
    body.append(text);
    
    let button = document.createElement("BUTTON");
    button.innerHTML = "Next Step";
    button.setAttribute("onclick", "location.href = 'second-step.html'");
    body.append(button);
  }
}

/**
 * Handles responses received from the audio processing web worker.
 * @param {MessageEvent} e The message from the audio processing web worker.
 */
function handleProcessorMessage (e) {
    if (e.data && e.data.octave < 10) {
        console.log(e.data.frequency);
      /*
      pitchText.textContent = e.data.key + e.data.octave.toString()
      frequencyText.textContent = e.data.frequency.toFixed(2) + 'Hz'
      targetFrequencyText.textContent = e.data.correctHz.toFixed(2) + 'Hz'
      centsText.textContent = Math.abs(e.data.centsOff).toFixed(2) +
        (e.data.centsOff > 0 ? ' sharp' : ' flat')
      */

    } 
    /*
    else {
      pitchText.textContent = 'Unknown'
      frequencyText.textContent = ''
      targetFrequencyText.textContent = ''
      centsText.textContent = ''
    }
    */
}
