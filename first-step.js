let audio = null;
let mediaRecorder = null;
let body = document.querySelector("body");
makeRecordButton();

function record() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const audioUrl = URL.createObjectURL(audioBlob);
          audio = new Audio(audioUrl);

          let stopbutton = document.getElementById("stopbutton");
          if (stopbutton != null) {
             stopbutton.parentNode.removeChild(stopbutton);
          }
          makeRecordButton();
        });
      }).catch(rejectReason => {
        console.log(rejectReason);
        let stopbutton = document.getElementById("stopbutton");
        if (stopbutton != null) {
            stopbutton.parentNode.removeChild(stopbutton);
        }
        makeRecordButton();
        alert("Please enable your microphone.");
        });
}

let playbutton = document.getElementById("playbutton");
playbutton.onclick = function() {
    if (audio != null) {
        audio.play();
    }
}

function makeStopButton() {
    let button = document.createElement("BUTTON");
    button.innerHTML = "Stop Recording";
    button.setAttribute("id", "stopbutton");
    button.onclick = function() {
        if (mediaRecorder != null) {
            mediaRecorder.stop();
        }
    };
    body.insertBefore(button, body.childNodes[3])
};

function makeRecordButton() {
    let button = document.createElement("BUTTON");
    button.innerHTML = "Record";
    button.setAttribute("id", "recordbutton");
    button.onclick = function() {
        record();
        makeStopButton();
        button.parentNode.removeChild(button);
    };
    body.insertBefore(button, body.childNodes[3])
};

localStorage.setItem('baseNote', 'C3'); 
