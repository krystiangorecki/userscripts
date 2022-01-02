// ==UserScript==
// @name         Steam to Bazar link (+Steamgifts +gg.deals)
// @author       krystiangorecki
// @version      2022.01.01
// @namespace    https://github.com/krystiangorecki/userscripts/
// @icon         https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg
// @match        https://store.steampowered.com/app/*
// @updateURL    https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @downloadURL  https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @grant        none
// ==/UserScript==

var header = document.querySelector('div.apphub_HomeHeaderContent div.apphub_AppName');

(function() {
    'use strict';
    setTimeout(addSteamgiftsLink, 100);
    setTimeout(addBazarLink, 150);
    setTimeout(addGGDealsLink, 200);
})();

function addGGDealsLink(){
    if(header!=undefined) {
        var gameTitle = header.innerText.replaceAll('®','').replaceAll('™','').replaceAll(':','').replaceAll('-',' ').replaceAll('—',' ').replaceAll('’',' ').replaceAll('\'',' ').replaceAll('  ',' ').replaceAll('  ',' ').trim().replaceAll(' ','-').toLowerCase();
        var ggdealsLink = document.createElement("a");
        ggdealsLink.innerHTML = '<img src="https://gg.deals/favicon-48x48.png" style="height:20px; margin-left:10px;"/>'
        ggdealsLink.setAttribute("href", "https://gg.deals/game/" + gameTitle);
        header.appendChild(ggdealsLink);
    }
}

function addBazarLink(){
    if(header!=undefined) {
        var gameTitle = header.innerText.replaceAll('®','').replaceAll('™','').replaceAll(':','').replaceAll('-',' ').replaceAll('—',' ').replaceAll('’','\'');
        var bazarLink = document.createElement("a");
        bazarLink.innerHTML = '<img src="https://bazar.lowcygier.pl/favicon.ico" style="height:20px; margin-left:10px;"/>'
        bazarLink.setAttribute("href", "https://bazar.lowcygier.pl/?options=&type=&platform=&payment=&game_type=&game_genre=&title=" + gameTitle + "&sort=-created_at&per-page=25");
        header.appendChild(bazarLink);
    }
}

function addSteamgiftsLink(){
    var appIdElement = document.querySelector('div.glance_tags');
    if(appIdElement!=undefined) {
        var appId = appIdElement.dataset.appid;
        var sgLink = document.createElement("a");
        sgLink.innerHTML = ' <img src="https://cdn.steamgifts.com/img/favicon.ico" style="height:20px; margin-left:10px;"/>'
        sgLink.setAttribute("href", "https://www.steamgifts.com/giveaways/search?app=" + appId);
        header.appendChild(sgLink);
    }
}
