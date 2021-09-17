// ==UserScript==
// @name         r hide not working now
// @namespace    https://github.com/krystiangorecki/userscripts/r
// @version      1.0
// @match        https://www.r.pl/pl/panel2/ulubione/aktywne
// @match        https://www.r.pl/pl/panel2/ulubione/aktywne/PageNr,1
// @match        https://www.r.pl/pl/panel2/ulubione/?x
// @match        https://www.r.pl/pl/panel2/ulubione
// @match        http://www.r.pl/pl/panel2/ulubione
// @grant        none
// ==/UserScript==

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function insertBefore(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.previousSibling);
}
function insertAsFirstChild(referenceNode, newNode) {
    referenceNode.insertBefore(newNode, referenceNode.firstChild);
}

//hide elements whose subElement contains needle
function hideElements(elementSelector, subElementSelector, needle){
    const boxes = Array.prototype.slice.apply(
        document.querySelectorAll(elementSelector)
    );
    for(var i=0; i< boxes.length; i++){
        var current = boxes[i];
        var working = current.querySelector(subElementSelector).innerText.indexOf(needle)==-1;
        if(!working){
            current.style.display='none';
        }
    }
}

//custom hide elements whose subElement contains hour range and current time is in range
function hideNotWorkingNow(elementSelector, subElementSelector){
    const boxes = Array.prototype.slice.apply(
        document.querySelectorAll(elementSelector)
    );
    debugger;
    for(var i=0; i< boxes.length; i++){
        var current = boxes[i];
        var rangeString = current.querySelector('#user_content img[alt=O]').parentElement.innerText;
        if(rangeString.indexOf("cały czas") > -1 || rangeString.indexOf("nie pracuje") > -1){
            continue;
        }
        var hours = rangeString.match(/(\d*) - (\d*)/);
        var hourNow = (new Date()).getHours();
        var startHour = parseInt(hours[1]);
        var endHour = parseInt(hours[2]);
        if (startHour < endHour) {
            // poczatek i koniec tego samego dnia
            if (hourNow + 1 >= endHour) {
                current.style.display='none';
            }
        } else {
            // pracuje "ponad" północ
           // if (startHour > hourNow + 1) {
           //     current.style.display='none';
           // }
        }
    }
}
function hideNotWorkingInit(){
    var newLink = document.createElement("span");
    newLink.innerHTML = '<a href="#"> ukryj niepracujące</a> <br />';
    insertBefore(document.querySelector('#user_content'), newLink);
    newLink.addEventListener("click", function(){
        hideElements('#user_content .favourites_box', 'div.favourites_prices', 'nie pracuje');
        hideNotWorkingNow('#user_content .favourites_box', 'div.favourites_prices');
    });
}

(function() {
    'use strict';
    hideNotWorkingInit();
})();
