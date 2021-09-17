// ==UserScript==
// @name         r search selected number
// @namespace    https://github.com/krystiangorecki/userscripts/r
// @version      1.0
// @match        https://www.r.pl/pl/panel2/ulubione/aktywne*
// @match        https://www.r.pl/pl/panel2/ulubione*
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

function exec() {
    addButton();
}

function addButton() {
    var newLink = document.createElement("button");
    newLink.innerText = 'search selected';
    newLink.id = 'searchButton';
    newLink.style = 'position:fixed; right: 10px; z-index: 10';
    insertBefore(document.querySelector('#user_content'), newLink);
    newLink.addEventListener("click", buttonExec);
}

function buttonExec(){
    var text = getSelectionText();
    debugger;
    if (text != undefined && text.length > 9) {
        var phone = text.replace(/[^0-9]/g,'').substring(0,9);
        if(phone.length==9){
            var url = 'https://www.r.pl/pl/szukaj/?anons_type=0&anons_state=0&anons_city_part=&cenaod=0&cenado=0&cenapoldo=0&cena15do=0&cenanocdo=0&wiekod=0&wiekdo=0&wagaod=0&wagado=0&wzrostod=0&wzrostdo=0&biustod=0&biustdo=0&jezyk=&dzien=0&hod=&hdo=&wyjazdy=0&name=&nr_tel=' + phone.split(' ').join('').split('-').join('') + "&key_word=#show";
            window.location = url;
        } else {
            alert("błąd: " + phone);
        }
    }
}

function getSelectionText() {
    return window.getSelection().toString();
}

(function() {
    'use strict';
    exec();
})();
