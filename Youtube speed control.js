// ==UserScript==
// @name         Youtube speed control
// @version      1.0
// @description  "Direction is more important than speed. You can go fast in the wrong direction."
// @author       kgorecki
// @match        https://www.youtube.com/watch*
// @icon         https://www.youtube.com/s/desktop/4fc9328c/img/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(function() { addManualStartButton(1); }, 500);
    setTimeout(function() { addManualStartButton(1.25); }, 500);
    setTimeout(function() { addManualStartButton(1.5); }, 500);
    setTimeout(function() { addManualStartButton(1.75); }, 500);
    setTimeout(function() { addManualStartButton(2); }, 500);
    setTimeout(function() { addManualStartButton(2.5); }, 500);
    setTimeout(function() { addManualStartButton(3); }, 500);
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
