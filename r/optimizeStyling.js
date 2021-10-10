// ==UserScript==
// @name         r optimize styling
// @namespace    https://github.com/krystiangorecki/userscripts/r
// @version      1.0
// @author       kgorecki
// @match        https://www.r.pl/pl/panel2/ulubione/aktywne
// @match        https://www.r.pl/pl/panel2/ulubione/aktywne/PageNr,1
// @match        https://www.r.pl/pl/panel2/ulubione/wylaczone
// @match        https://www.r.pl/pl/panel2/ulubione/?x
// @match        https://www.r.pl/pl/panel2/ulubione
// @match        http://www.r.pl/pl/panel2/ulubione
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
    document.querySelectorAll('.favourites_note').forEach(el => {el.remove()});
    document.querySelectorAll('a[title="usuń"]').forEach(el => {el.remove()});
    document.querySelectorAll('.favourites_content_list>br').forEach(el => {el.remove()});
    document.querySelectorAll('.favourites_box_conteiner_footer').forEach(el => {el.remove()});

    GM_addStyle(' .anons_info {padding: 0px  !important; }');
    GM_addStyle(' .favourites_content_list {margin: 0px !important; }');
    GM_addStyle(' .favourites_box:hover { margin: 1px 0px 1px 0px  !important; }');
    GM_addStyle(' .favourites_box { height: 400px;  margin: 2px 1px 2px 1px;  !important; }');
    GM_addStyle(' .favourites_name { margin: 1px; !important; }');
    GM_addStyle(' .button_red { padding: 0px 15px; height: 20px; font-size: 13px; !important; }');
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
