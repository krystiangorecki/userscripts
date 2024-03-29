// ==UserScript==
// @name         r search page additions
// @namespace    http://tampermonkey.net/
// @version      0.92
// @description  try to take over the world!
// @author       You
// @match        https://www.r.pl/pl/szukaj/*
// @grant        none
// ==/UserScript==

var g = atob('Z2Fyc29uaWVyYS5jb20ucGw=');
var r = atob('cm9rc2EucGw=');

(function() {
    'use strict';
    phoneSearchG();
    boxSearchByAdNumber();
    addR2Links();
})();

function addR2Links() {
    var url = 'https://www.' + r + '/pl/panel2/ulubione#:~:text=';
    addR2(url, "r2a");
    url = 'https://www.' + r + '/pl/panel2/ulubione/wylaczone#:~:text=';
    addR2(url, "r2n");
}

function boxSearchByAdNumber() {
    document.querySelectorAll('#anons_group>a').forEach((box) => {
        var adNumber = box.href.substring(box.href.lastIndexOf('/')+1);
        var url = 'http://' + g + '/forum/index.php?app=googlecse#gsc.tab=0&gsc.q=' + adNumber;
        var newLink = document.createElement("span");
        newLink.innerHTML = ' <a href="' + url + '" style=" margin:-20px;   text-decoration: none;        text-align: center;    display: inline-block;    border-width: 2px;    border-style: solid;    border-color: red;   padding: 2px 2px;    " > g2 </a>';
        insertAfter(box, newLink);
    });
}

function phoneSearchG() {
    var phoneInput = document.querySelector('#anons_tel');
    if (phoneInput != undefined && phoneInput.value.length == 9) {
        var phoneNumberWithDashes = phoneInput.value.slice(0,3) + '-' + phoneInput.value.slice(3,6) + '-' + phoneInput.value.slice(6,9) ;
        var url = 'http://' + g + '/forum/index.php?app=googlecse#gsc.tab=0&gsc.q=%22' + phoneNumberWithDashes + '%22';
        var newLink = document.createElement("span");
        newLink.innerHTML = ' <a href="' + url + '" style="   text-decoration: none;        text-align: center;    display: inline-block;    border-width: 2px;    border-style: solid;    border-color: red;   padding: 1px 2px;    " >&nbsp;g&nbsp;</a>';
        insertAfter(phoneInput, newLink);
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
function insertAsLastChild(referenceNode, newNode) {
    insertAfter(referenceNode.lastChild, newNode);
}

function addR2(url, label){
    var phoneInput = document.querySelector('#anons_tel');
    if (phoneInput != undefined && phoneInput.value.length == 9) {
        var phoneNumberWithDashes = phoneInput.value.slice(0,3) + '-' + phoneInput.value.slice(3,6) + '-' + phoneInput.value.slice(6,9) ;
        url = url + phoneNumberWithDashes;
        var newLink = document.createElement("span");
        newLink.innerHTML = ' <a id="' + label + '" style="   text-decoration: none;        text-align: center;    display: inline-block;    border-width: 2px;    border-style: solid;    border-color: red;   padding: 1px 2px;    " href="' + url + '">&nbsp;' + label + '&nbsp;</a>';
        var questionMarkElement = document.querySelector('#h_main_telefon');
        insertBefore(questionMarkElement, newLink);
    }
}
