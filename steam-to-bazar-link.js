// ==UserScript==
// @name         Steam to Bazar link
// @author       krystiangorecki
// @version      2020.09.31
// @namespace    https://github.com/krystiangorecki/steamgifts-userscripts/
// @icon         https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg
// @match        https://store.steampowered.com/app/*
// @updateURL    https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @downloadURL  https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(execute, 100);
})();

function execute(){
    var header = document.querySelector('div.apphub_HomeHeaderContent div.apphub_AppName');
    debugger;
    if(header!=undefined) {
        var gameTitle = header.innerText.replaceAll('®','').replaceAll('™','').replaceAll(':','').replace('-',' ');
        var bazarLink = document.createElement("a");
        bazarLink.innerHTML = ' <img src="https://bazar.lowcygier.pl/favicon.ico" style="height:20px"/>'
        bazarLink.classList.add('bazar');
        bazarLink.setAttribute("href", "https://bazar.lowcygier.pl/?options=&type=&platform=&payment=&game_type=&game_genre=&title=" + gameTitle + "&sort=-created_at&per-page=25");
        header.appendChild(bazarLink);
    }
}
