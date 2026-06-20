// ==UserScript==
// @name         Steam to Bazar link (+Steamgifts +gg.deals)
// @author       krystiangorecki
// @version      2026.06.20
// @namespace    https://github.com/krystiangorecki/userscripts/
// @icon         https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg
// @match        https://store.steampowered.com/app/*
// @updateURL    https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @downloadURL  https://raw.githubusercontent.com/krystiangorecki/userscripts/master/steam-to-bazar-link.js
// @grant        none
// ==/UserScript==

// v2025.12.13 +gg.deals
// v2026.02.22 +hltb
// v2026.04.20 +steamdb
// v2026.06.20 &

var appName = document.querySelector('div.apphub_HomeHeaderContent div.apphub_AppName');
var appId = document.querySelector('div.glance_tags').dataset.appid;
var gameTitle;

(function() {
    'use strict';
    if (appName == undefined) {
        alert('Steam to Bazar link couldn\'t retrieve appName');
        return;
    }
    if (appId == undefined) {
        alert('Steam to Bazar link couldn\'t retrieve appId');
        return;
    }
    setTimeout(exec, 50);
})();

function exec() {
    gameTitle = appName.innerText.replaceAll('& ','').replaceAll('®','').replaceAll('™','').replaceAll(':','').replaceAll('-',' ').replaceAll('—',' ').replaceAll('’','').replaceAll('\'','').replaceAll('.',' ').replaceAll('  ',' ').replaceAll('  ',' ').replaceAll('+','').trim().replaceAll('--','-').replaceAll('!','').replaceAll('’','\'').toLowerCase();
    setTitleDisplayInline();
    addGGDealsLink();
    addBazarLink();
    addSteamdbLink()
    addHltbLink();
    addSteamgiftsLink();
}

function setTitleDisplayInline() {
    appName.style = appName.style + '; display:inline';
}

function addGGDealsLink() {
    var ggdealsLink = document.createElement("a");
    ggdealsLink.innerHTML = '<img src="https://gg.deals/favicon-48x48.png" style="height:20px; margin-left:10px; user-select: none;"/>'
    ggdealsLink.setAttribute("href", "https://gg.deals/game/" + gameTitle.replaceAll(' ','-'));
    insertAfter(appName, ggdealsLink);
}

function addBazarLink() {
    var bazarLink = document.createElement("a");
    bazarLink.innerHTML = '<img src="https://bazar.lowcygier.pl/favicon.ico" style="height:20px; margin-left:10px; user-select: none;"/>'
    bazarLink.setAttribute("href", "https://bazar.lowcygier.pl/?options=&type=&platform=&payment=&game_type=&game_genre=&title=" + gameTitle + "&sort=-created_at&per-page=25");
    insertAfter(appName, bazarLink);
}

function addSteamgiftsLink() {
    var sgLink = document.createElement("a");
    sgLink.innerHTML = '<img src="https://cdn.steamgifts.com/img/favicon.ico" style="height:20px; margin-left:10px; user-select: none;"/>'
    sgLink.setAttribute("href", "https://www.steamgifts.com/giveaways/search?app=" + appId);
    insertAfter(appName, sgLink);
}

function addHltbLink() {
    var hltbLink = document.createElement("a");
    hltbLink.innerHTML = '<img src="https://howlongtobeat.com/img/icons/favicon-32x32.png" style="height:20px; margin-left:10px; user-select: none;"/>'
    hltbLink.setAttribute("href", "https://howlongtobeat.com/?q=" + gameTitle);
    insertAfter(appName, hltbLink);
}

function addSteamdbLink() {
    var sgLink = document.createElement("a");
    sgLink.innerHTML = '<img src="https://steamdb.info/static/logos/vector_prefers_schema.svg" style="height:17px; margin-left:10px; user-select: none;"/>'
    sgLink.setAttribute("href", "https://steamdb.info/app/" + appId + "/charts/");
    insertAfter(appName, sgLink);
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
