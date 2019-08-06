let base = localStorage.getItem('baseNote');
let body = document.querySelector("body");
let text = document.createElement("p");
let node = document.createTextNode("Your base note was " + base + ".");
text.append(node);
body.append(text);
