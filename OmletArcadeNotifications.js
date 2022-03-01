// ==UserScript==
// @name         omlet.gg sound notifications
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        https://omlet.gg/profile/ffrreeaakk1
// @grant        GM_notification
// ==/UserScript==

var retryCount = 1;

(function() {
    'use strict';

    setTimeout(init , 1000);

})();

var unread = 0;
var originalTitle = document.title;

function init() {
    debugger;
    var containersToMonitor = document.querySelectorAll('div[class^=floatChats__float-chat] div[class^=content__chat__]');
    if (containersToMonitor.length == 0) {
        console.log('containersToMonitor not found //' + retryCount);
        if (retryCount < 5) {
            setTimeout(init , 2000);
            retryCount++;
        } else {
            console.log('max retryCount reached, it\'s over');
            playError();
        }
        return;
    }
    console.log('found ' + containersToMonitor.length + ' containersToMonitor  //retryCount:' + retryCount);

    containersToMonitor.forEach(obj => {
        console.log(obj);
        observeDOM( obj, function(m){
            // to jest callback
            var addedNodes = [], removedNodes = [];
            m.forEach(record => record.addedNodes.length & addedNodes.push(...record.addedNodes))
            // m.forEach(record => record.removedNodes.length & removedNodes.push(...record.removedNodes))
            // console.clear();
            console.log('Added:', addedNodes, 'Removed:', removedNodes);
            if (addedNodes.length>0){
                unread += addedNodes.length;
                updateTitle(obj);
                debugger;
                showNotification(obj);
                playOK();
            }
        });
        console.log('monitoring started');
    } );
}

function showNotification(obj) {
    var name = obj.parentElement.parentElement.querySelector('a[href^="/profile/"]').innerText;
    GM_notification ( {title: name, text:  '+1 ('+unread+')', timeout: 2000 });
}

function updateTitle(obj){
    document.title = '(' + unread + ') ' + originalTitle;
    obj.myParam = obj;
    console.log('adding listener for ' + obj.myParam);
    obj.addEventListener("mouseenter", resetTitle, false);
}

function resetTitle(event) {
    var obj = event.currentTarget.myParam;
    console.log('removing listener for ' + obj);
    obj.removeEventListener("mouseenter", resetTitle, false);
    document.title = originalTitle;
}

// https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
var observeDOM = (function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    return function( obj, callback ){
        if( !obj || obj.nodeType !== 1 ) return;

        if( MutationObserver ){
            var mutationObserver = new MutationObserver(callback)
            mutationObserver.observe( obj, { childList:true, subtree:true })
            return mutationObserver
        }

    }
})();

function playOK() {
    var audio = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    audio.play();
}

function playError() {
    var audio = new Audio("data:audio/wav;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU5LjE2LjEwMAAAAAAAAAAAAAAA//sowAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAADhABcXFxcXFxcXFxcXFxcXFxcXFxchYWFhYWFhYWFhYWFhYWFhYWFhYWurq6urq6urq6urq6urq6urq6urtfX19fX19fX19fX19fX19fX19fX//////////////////////////8AAAAATGF2YzU5LjE4AAAAAAAAAAAAAAAAJAJEAAAAAAAAA4RsZQXIAAAA//sYxAAABmDxKjQigAEDnS93HiACQCc7yEZQAQ3Rv/+hMjc/6EJyc5+d8hGyEznfOf//yNOc5znIQjKHw+LoA4HOUBD5SD4f1tp1W1Ge0221SdFAAARk7OpCxk211QlJWX3c3i1WwAMCAe51w9tz45nXtkbejHGun+Rkb5VVv+f/QR/nDy3T/yC3Qm6aa0RM//sYxAOAB4y1fbyTgDDxmm20wxXWADKK1U3Yv9ByRMfb295xA/9VEQKIroyHbP09WzhWXeb//6r9RAPlm3/KgYO4nc+pL1otDr1uRgOuNRsAAAuqjDzYkLwm6ISmxQU1wtD8QDC6BVO9Tm45RYr/ldBh0KmZ3VZjOX/Xbf/7//RQHBis//+mmiRjk3tqDAAJ//sYxASAR9zRVaYNTcDnC600nKSaOlg+hYvWCC9G6XR0QHPIyZs2g5ARLn/+c5Z8jHd0zyPm8XJTn0V+z65nqeTgoEOOOBj5+63QpJHI5JAAtEeFBIF2yKGobGOQcEwkaLBMFcoKlkbbnqioQkRUsWTKKmgAK7Nt25qaVpSDwMv////8hQ2U6ijEgQgBhYhy//sYxAWAB3x3YaygTRD5DCncl4zQei2dSJSBSs/7g1xab9phi4u6eKu8//NB6BIWSXu7s3+iM9AoU//mXf7A7oqivajrOIHemRoAAY6gTQkLIhOkzQMpwFyVzMKOszAR1VVj1JnEqf6gImeoUk0tBQKlsUPD2kTfgIr/+VITpYC55y+LKmvgAAmDqGyRj4Kj//sYxAWABzCxLEekYAiVAaKokwwAVYx1AEqUZvv+vqdv1GOzsMwRlZmS+Gg5KcuZLxjzpLswpsKhYza4NBUOLn3YXxAB9ZACJAABSAOEhqAmuHliVDHRnoZaMQKgIiMJP9fd+x3/QwemTEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
    audio.play();
}
