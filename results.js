let lowNote = localStorage.getItem('lowNote');
let highNote = localStorage.getItem('highNote');
let body = document.querySelector("body");
let text = document.createElement("p");
let node = document.createTextNode(lowNote + " to " + highNote);
text.append(node);
body.append(text);
