// ==UserScript==
// @name         Steam to Bazar link (+Steamgifts +gg.deals)
// @author       krystiangorecki
// @version      2025.12.13
// @namespace    https://github.com/krystiangorecki/userscripts/
// @icon         https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg
// @match        https://store.steampowered.com/app/*
// @updateURL    https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @downloadURL  https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @grant        none
// ==/UserScript==

var appName = document.querySelector('div.apphub_HomeHeaderContent div.apphub_AppName');

(function() {
    'use strict';
    if (appName != undefined) {
        setTimeout(setTitleDisplayInline, 50);
        setTimeout(addGGDealsLink, 100);
        setTimeout(addBazarLink, 110);
        setTimeout(addSteamgiftsLink, 120);
    }
})();

function setTitleDisplayInline(){
    appName.style = appName.style + '; display:inline';
}

function addGGDealsLink(){
    var gameTitle = appName.innerText.replaceAll('®','').replaceAll('™','').replaceAll(':','').replaceAll('-',' ').replaceAll('—',' ').replaceAll('’','').replaceAll('\'','').replaceAll('.',' ').replaceAll('  ',' ').replaceAll('  ',' ').replaceAll('+','').trim().replaceAll(' ','-').replaceAll('--','-').toLowerCase();
    var ggdealsLink = document.createElement("a");
    ggdealsLink.innerHTML = '<img src="https://gg.deals/favicon-48x48.png" style="height:20px; margin-left:10px; user-select: none;"/>'
    ggdealsLink.setAttribute("href", "https://gg.deals/game/" + gameTitle);
    insertAfter(appName, ggdealsLink);
}

function addBazarLink(){
    var gameTitle = appName.innerText.replaceAll('®','').replaceAll('™','').replaceAll(':','').replaceAll('-',' ').replaceAll('—',' ').replaceAll('’','\'');
    var bazarLink = document.createElement("a");
    bazarLink.innerHTML = '<img src="https://bazar.lowcygier.pl/favicon.ico" style="height:20px; margin-left:10px; user-select: none;"/>'
    bazarLink.setAttribute("href", "https://bazar.lowcygier.pl/?options=&type=&platform=&payment=&game_type=&game_genre=&title=" + gameTitle + "&sort=-created_at&per-page=25");
    insertAfter(appName, bazarLink);
}

function addSteamgiftsLink(){
    var appIdElement = document.querySelector('div.glance_tags');
    if (appIdElement != undefined) {
        var appId = appIdElement.dataset.appid;
        var sgLink = document.createElement("a");
        sgLink.innerHTML = ' <img src="https://cdn.steamgifts.com/img/favicon.ico" style="height:20px; margin-left:10px; user-select: none;"/>'
        sgLink.setAttribute("href", "https://www.steamgifts.com/giveaways/search?app=" + appId);
        insertAfter(appName, sgLink);
    }
}


function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
