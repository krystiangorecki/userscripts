// ==UserScript==
// @name         esc autoselect Łódź
// @namespace    https://github.com/krystiangorecki/userscripts/
// @version      0.3
// @description  try to take over the world!
// @author       You
// @match        https://esc*/*
// @grant        none
// ==/UserScript==

var done = false;

(function() {
    'use strict';

    addLodzLink();
    addFavoritesLink();

    var cityList = document.querySelector('button[data-id="city-list"]');
    if (cityList == null){
        return;
    }

    monitor('button[data-id="city-list"]', callback);
    if(!done) {
        // setTimeout( function() {
        var index = findLodzkieIndex();
        document.querySelector('select[name="province"]').parentElement.querySelector('li[data-original-index="' + index + '"]>a').click();
        // }, 10);
    }
})();

function addLodzLink() {
    var newLink = document.createElement("a");
    newLink.innerText = 'Łódź';
    newLink.href=atob('L3R3b2plLWtvbnRvL2Zhdm9yaXRlcy8=');
    newLink.style="position:absolute; left: 100px; top:50px;"
    insertBefore(document.querySelector('div.page-wrap'), newLink);
}

function addFavoritesLink() {
    var newLink = document.createElement("a");
    var linkImg = document.createElement("svg");
    newLink.appendChild(linkImg);
    linkImg.outerHTML = '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>';
    newLink.href='/twoje-konto/favorites/';
    newLink.style="position:absolute; left: 100px; top:70px; width:20px"
    insertBefore(document.querySelector('div.page-wrap'), newLink);
}

function callback(m) {
    setTimeout( function() {
        delayedCallback(m);
    }, 100);
}

function delayedCallback(m) {
    var addedNodes = [];
    m.forEach(record => record.addedNodes.length & addedNodes.push(...record.addedNodes));
    if (addedNodes.length > 0){
        // setTimeout( function() {
        // document.querySelector('button[data-id="city-list"]').click();
        var lodzIndex = findLodzIndex();
        if(lodzIndex != undefined && !done) {
            document.querySelector('button[data-id="city-list"]').parentElement.querySelector('li[data-original-index="' + lodzIndex + '"]>a').click();
            done = true;
        }
        // }, 10);
    }
}

function findLodzkieIndex() {
    var lis = document.querySelector('select[name="province"]').parentElement.querySelectorAll('li');
    for (var i = 0 ; i<lis.length ; i++) {
        if (lis[i].innerText.indexOf('Łódzkie') > -1) {
            return lis[i].getAttribute('data-original-index');
        }
    }
}

function findLodzIndex() {
    var lis = document.querySelector('button[data-id="city-list"]').parentElement.querySelectorAll('li');
    for (var i = 0 ; i<lis.length ; i++) {
        if (lis[i].innerText.indexOf('Łódź') > -1) {
            return lis[i].getAttribute('data-original-index');
        }
    }
}

function monitor(selector, callbackF) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    if (MutationObserver){
        var containersToMonitor = document.querySelectorAll(selector);
        if(containersToMonitor == undefined) {
            console.log('Invalid selector');
            return;
        }
        containersToMonitor.forEach(obj => {
            if ( !obj || obj.nodeType !== 1 ) return;
            var mutationObserver = new MutationObserver(callbackF);
            mutationObserver.observe( obj.parentElement, { childList:true, subtree:true });
        });
        //console.log('monitoring started');
    }
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function insertBefore(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.previousSibling);
}
function insertAsFirstChild(referenceNode, newNode) {
    referenceNode.insertBefore(newNode, referenceNode.firstChild);
}
