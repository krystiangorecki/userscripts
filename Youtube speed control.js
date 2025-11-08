// ==UserScript==
// @name         Youtube speed control
// @namespace    https://github.com/krystiangorecki/userscripts/
// @version      1.6
// @description  "Direction is more important than speed. You can go fast in the wrong direction."
// @match        https://www.youtube.com/watch*
// @match        https://www.youtube.com/live/*
// @match        https://www.youtube.com/shorts/*
// @icon         https://www.youtube.com/s/desktop/4fc9328c/img/favicon.ico
// @updateURL    https://raw.githubusercontent.com/krystiangorecki/userscripts/master/Youtube%20speed%20control.js
// @downloadURL  https://raw.githubusercontent.com/krystiangorecki/userscripts/master/Youtube%20speed%20control.js
// @grant        none
// ==/UserScript==

// v1.5 works for shorts
// v1.6 custom labels and fast forward

var retry = 0;
var max_retry = 20;

(function() {
    'use strict';
    exec();
})();

function exec() {
    debugger;
    var buttons = document.querySelector('#buttons');
    if (buttons==undefined) {
        if (retry < max_retry) {
            retry++;
            console.log('adding speed control - retry ' + retry);
            setTimeout(exec, 500);
        } else {
            console.log('adding speed control - retry limit reached //' + max_retry);
        }
    } else {
        setTimeout(function() { addManualStartButton(1);   }, 200);
        setTimeout(function() { addManualStartButton(1.05);}, 200);
        setTimeout(function() { addManualStartButton(1.1); }, 200);
        setTimeout(function() { addManualStartButton(1.25);}, 200);
        setTimeout(function() { addManualStartButton(1.5); }, 200);
        setTimeout(function() { addManualStartButton(1.75);}, 200);
        setTimeout(function() { addManualStartButton(2);   }, 200);
        setTimeout(function() { addManualStartButton(2.1); }, 200);
        setTimeout(function() { addManualStartButton(2.2); }, 200);
        setTimeout(function() { addManualStartButton(2.3); }, 200);
        setTimeout(function() { addManualStartButton(2.4); }, 200);
        setTimeout(function() { addManualStartButton(2.5); }, 200);
        setTimeout(function() { addManualStartButton(2.6); }, 200);
        setTimeout(function() { addManualStartButton(2.7); }, 200);
        setTimeout(function() { addManualStartButton(2.8); }, 200);
        setTimeout(function() { addManualStartButton(3);   }, 200);
        setTimeout(function() { addManualStartButton(16, ">>"); }, 200);
    }
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function insertBefore(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.previousSibling);
}
function insertAsFirstChild(referenceNode, newNode) {
    referenceNode.insertBefore(newNode, referenceNode.firstChild);
}

function addManualStartButton(speed, optionalLabel) {
    var newLink = document.createElement("a");
    newLink.textContent = optionalLabel==undefined ? speed : optionalLabel;
    newLink.id = 'startButton'+speed;
    newLink.style = 'color:#696969; margin-right:5px';
    var buttons = document.querySelector('#buttons');
    insertBefore(buttons, newLink);
    newLink.addEventListener("click", function(){setSpeed(speed)});
}

function setSpeed(speed) {
    let videoIndex;
    if (window.location.pathname.startsWith("/shorts/")) {
        const videos = document.getElementsByTagName("video");
        for (const video of videos) {
            if (!video.paused && !video.ended) {
                console.log('video.playbackRate = ' + speed);
                video.playbackRate = speed;
            }
        }
    } else {
        console.log('document.getElementsByTagName("video")[0].playbackRate = ' + speed);
        document.getElementsByTagName("video")[0].playbackRate = speed;
    }
}
