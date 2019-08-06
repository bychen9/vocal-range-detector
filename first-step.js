let audio = null;
let body = document.querySelector("body");
let count = 0;

function record() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const audioUrl = URL.createObjectURL(audioBlob);
          audio = new Audio(audioUrl);
          count++;
          let text = document.createElement("p");
          let node = document.createTextNode("Recording " + count + "  complete");
          text.append(node);
          body.append(text);
        });

        setTimeout(() => {
          mediaRecorder.stop();
        }, 5000);
      });
}

let recordbutton = document.getElementById("recordbutton");
recordbutton.onclick = record;

let playbutton = document.getElementById("playbutton");
playbutton.onclick = function() {
    if (audio != null) {
        audio.play();
    }
}

localStorage.setItem('baseNote', 'C3'); 
