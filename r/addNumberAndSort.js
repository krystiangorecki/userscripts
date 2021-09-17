// ==UserScript==
// @name         r add number and sort
// @namespace    https://github.com/krystiangorecki/userscripts/r
// @version      1.0
// @author       kgorecki
// @match        https://www.r.pl/pl/panel2/ulubione/aktywne*
// @match        https://www.r.pl/pl/panel2/ulubione*
// @match        http://www.r.pl/pl/panel2/ulubione
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    uzupelnijIZapiszNumeryInit();
    posortujPoMiejscowosciInit();
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

function warunekPrzeniesieniaNaKoniec(box) {
    var zLodzi = box.innerText.indexOf('Łódź')>0;
    var wiwulskiegozaolzianska = box.innerText.toUpperCase().indexOf('500-006-742')>-1;
    var result = !(zLodzi || wiwulskiegozaolzianska);
    return result;
}

function posortujPoMiejscowosciExec() {
    const boxes = Array.prototype.slice.apply(
        document.querySelectorAll('div.ui-sortable-handle')
    );
    var container = document.querySelector('div.ui-sortable');
    boxes.forEach(b => warunekPrzeniesieniaNaKoniec(b) ? container.appendChild(b) : '');
    alert(boxes.length + ' zapisano');
}

function uzupelnijIZapiszNumeryExec() {
    debugger;
    const boxes = Array.prototype.slice.apply(
        document.querySelectorAll('#user_content .favourites_box')
    );
    var newNumberCounter = 0;
    var updatedSpacesCounter = 0;
    for (var i=0; i < boxes.length; i++) {
        var toUpdate = false;
        var current = boxes[i];
        var numer = current.querySelector('.dane_anonsu_tel');
        if (numer != undefined) {
            numer = numer.innerText.replaceAll(' ', '-')
        }
        var area = current.querySelector('textarea[name="tresc"]');
        if (area.value.match(/\d\d\d \d\d\d \d\d\d/)) {
            alert("zamieniam numer ze spacjami dla: " + current.querySelector('.favourites_name').innerText + "\n\n" + area.value);
            area.value = area.value.replaceAll(/(\d\d\d) (\d\d\d) (\d\d\d)/g, '$1-$2-$3');
            updatedSpacesCounter++;
            toUpdate = true;
        }
        if (numer != undefined && area.value.indexOf(numer)==-1) {
            //brak numeru, więc dodaję
            area.value = numer + ' ; ' + area.value;
            newNumberCounter++;
            toUpdate = true;
        }
        if (toUpdate) {
            // area.style="border-width: 5px;"
            var submitButton = current.querySelector('form.user_note_form [type=submit]');
            submitButton.click();
        }
    }
    if (newNumberCounter > 0 || updatedSpacesCounter > 0) {
        var newAmountText = document.createElement("span");
        newAmountText.innerText = ' dodano ' + newNumberCounter + ' zaktualizowano spacje ' + updatedSpacesCounter;
        insertAfter(document.querySelector('#addAndSaveNumbers'), newAmountText);
    }
}

function zapiszPosortowaneZmiany(){
    document.querySelector('#updateKolejnosc').click();
}

function uzupelnijIZapiszNumeryInit() {
    var newLink = document.createElement("span");
    newLink.innerHTML = '<a id="addAndSaveNumbers" href="#"> uzupełnij i zapisz brakujące numery (raz na jakiś czas)</a><br />';
    insertBefore(document.querySelector('#user_content'), newLink);
    newLink.addEventListener("click", function(){
        uzupelnijIZapiszNumeryExec();
    });
}

function posortujPoMiejscowosciInit() {
    var newLink = document.createElement("span");
    newLink.innerHTML = '<a href="#"> posortuj po miejscowosci</a> <br />';
    insertBefore(document.querySelector('#user_content'), newLink);
    newLink.addEventListener("click", function(){
        posortujPoMiejscowosciExec();
        zapiszPosortowaneZmiany();
        setTimeout(scrollToDivider, 10);
    });
}

function scrollToDivider() {
    var divider = document.querySelector('#divider');
    if (divider != null) {
        window.location='#divider';
    }
}
