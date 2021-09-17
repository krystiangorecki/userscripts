// ==UserScript==
// @name         r optimize styling
// @namespace    https://github.com/krystiangorecki/userscripts/r
// @version      1.0
// @author       kgorecki
// @match        https://www.roksa.pl/pl/panel2/ulubione/aktywne
// @match        https://www.roksa.pl/pl/panel2/ulubione/aktywne/PageNr,1
// @match        https://www.roksa.pl/pl/panel2/ulubione/wylaczone
// @match        https://www.roksa.pl/pl/panel2/ulubione/?x
// @match        https://www.roksa.pl/pl/panel2/ulubione
// @match        http://www.roksa.pl/pl/panel2/ulubione
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    dividerAfterŁódź();
    optimizeStyling();
    addFullWidthButton();
})();

function dividerAfterŁódź(){
    const boxes = Array.prototype.slice.apply(
        document.querySelectorAll('#user_content .favourites_box')
    );
    for(var i=0; i< boxes.length; i++) {
        var dwiePodRzadZLodzi = boxes[i].innerText.indexOf('Łódź')==-1 && boxes[i+1].innerText.indexOf('Łódź')==-1;
        if (dwiePodRzadZLodzi) {
            var hr = document.createElement("hr");
            hr.style="height:20px;";
            hr.id="divider";
            insertBefore(boxes[i], hr);
            break;
        }
    }
}

function optimizeStyling(){

    var labels = document.querySelectorAll('.favourites_note');
    for (var i = 0; i < labels.length; ++i) {
        labels[i].remove();
    }
    labels = document.querySelectorAll('a[title="usuń"]');
    for (i = 0; i < labels.length; ++i) {
        labels[i].remove();
    }


    GM_addStyle(' .favourites_box:hover { margin: 1px 0px 1px 0px  !important; }');
    const fav = Array.prototype.slice.apply(
        document.querySelectorAll('div.favourites_box')
    );
    fav.forEach(b => { b.setAttribute("style"," height: 440px;  margin: 2px 1px 2px 1px;  ") } );
    const favname = Array.prototype.slice.apply(
        document.querySelectorAll('div.favourites_name')
    );
    favname.forEach(b => { b.setAttribute("style","margin: 1px") } );

    GM_addStyle(' .anons_info {padding: 0px  !important; }');
    GM_addStyle(' .favourites_content_list {margin: 0px !important; }');
}

function addFullWidthButton(){
    var newLink = document.createElement("span");
    newLink.innerHTML = '<a href="#"> full width </a> <br />';
    insertBefore(document.querySelector('#user_content'), newLink);
    newLink.addEventListener("click", function(){
        applyFullWidth();
    });
}

function applyFullWidth(){
    debugger;
    var main = document.querySelector('#main');
    main.style.width="100%";
}

function insertBefore(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.previousSibling);
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
