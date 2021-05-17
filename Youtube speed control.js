// ==UserScript==
// @name         Youtube speed control
// @namespace    https://github.com/krystiangorecki/userscripts/
// @version      1.1
// @description  "Direction is more important than speed. You can go fast in the wrong direction."
// @match        https://www.youtube.com/watch*
// @icon         https://www.youtube.com/s/desktop/4fc9328c/img/favicon.ico
// @updateURL    https://raw.githubusercontent.com/krystiangorecki/userscripts/master/Youtube%20speed%20control.js
// @downloadURL  https://raw.githubusercontent.com/krystiangorecki/userscripts/master/Youtube%20speed%20control.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(function() { addManualStartButton(1);   }, 200);
    setTimeout(function() { addManualStartButton(1.25);}, 200);
    setTimeout(function() { addManualStartButton(1.5); }, 200);
    setTimeout(function() { addManualStartButton(1.75);}, 200);
    setTimeout(function() { addManualStartButton(2);   }, 200);
    setTimeout(function() { addManualStartButton(2.1); }, 200);
    setTimeout(function() { addManualStartButton(2.2); }, 200);
    setTimeout(function() { addManualStartButton(2.3); }, 200);
    setTimeout(function() { addManualStartButton(2.4); }, 200);
    setTimeout(function() { addManualStartButton(2.5); }, 200);
    setTimeout(function() { addManualStartButton(3);   }, 200);
})();

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function insertBefore(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.previousSibling);
}
function insertAsFirstChild(referenceNode, newNode) {
    referenceNode.insertBefore(newNode, referenceNode.firstChild);
}

function addManualStartButton(speed) {
    var newLink = document.createElement("a");
    newLink.innerHTML = ' &nbsp;&nbsp;' + speed + '&nbsp;&nbsp; ';
    newLink.id = 'startButton'+speed;
    newLink.style = 'color:#696969;';
    insertBefore(document.querySelector('#buttons'), newLink);
    newLink.addEventListener("click", function(){setSpeed(speed)});
}

function setSpeed(speed) {
    document.getElementsByTagName("video")[0].playbackRate = speed;
}
