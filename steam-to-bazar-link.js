// ==UserScript==
// @name         Steam to Bazar link (and Steamgifts)
// @author       krystiangorecki
// @version      2021.06.02
// @namespace    https://github.com/krystiangorecki/userscripts/
// @icon         https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg
// @match        https://store.steampowered.com/app/*
// @updateURL    https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @downloadURL  https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(addSteamgiftsLink, 100);
    setTimeout(addBazarLink, 150);
})();

function addBazarLink(){
    var header = document.querySelector('div.apphub_HomeHeaderContent div.apphub_AppName');
    if(header!=undefined) {
        var gameTitle = header.innerText.replaceAll('®','').replaceAll('™','').replaceAll(':','').replaceAll('-',' ').replaceAll('—',' ').replaceAll('’','\'');
        var bazarLink = document.createElement("a");
        bazarLink.innerHTML = '<img src="https://bazar.lowcygier.pl/favicon.ico" style="height:20px; margin-left:10px;"/>'
        bazarLink.classList.add('bazar');
        bazarLink.setAttribute("href", "https://bazar.lowcygier.pl/?options=&type=&platform=&payment=&game_type=&game_genre=&title=" + gameTitle + "&sort=-created_at&per-page=25");
        header.appendChild(bazarLink);
    }
}

function addSteamgiftsLink(){
    var header = document.querySelector('div.apphub_HomeHeaderContent div.apphub_AppName');
    var appIdElement = document.querySelector('div.glance_tags');
    if(appIdElement!=undefined) {
        var appId = appIdElement.dataset.appid;
        var sgLink = document.createElement("a");
        sgLink.innerHTML = ' <img src="https://cdn.steamgifts.com/img/favicon.ico" style="height:20px; margin-left:10px;"/>'
        sgLink.classList.add('steamgifts');
        sgLink.setAttribute("href", "https://www.steamgifts.com/giveaways/search?app=" + appId);
        header.appendChild(sgLink);
    }
}
