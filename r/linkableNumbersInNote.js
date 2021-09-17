// ==UserScript==
// @name         r linkable numbers in note
// @namespace    https://github.com/krystiangorecki/userscripts/r
// @version      1.0
// @description  try to take over the world!
// @match        https://www.r.pl/pl/anonse/pokaz/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var note = document.querySelector('#notatka_content');
    if(note!=undefined) {
        note.innerHTML = note.innerHTML.replace(/(\d{3}[ -]\d{3}[ -]\d{3})/g,'<a href="https://www.r.pl/pl/szukaj/?anons_type=0&anons_state=0&anons_city_part=&cenaod=0&cenado=0&cenapoldo=0&cena15do=0&cenanocdo=0&wiekod=0&wiekdo=0&wagaod=0&wagado=0&wzrostod=0&wzrostdo=0&biustod=0&biustdo=0&jezyk=&dzien=0&hod=&hdo=&wyjazdy=0&name=&nr_tel=$1&key_word=#show" class="linkDoG dynamicTarget">$1</a>');
    }
})();
