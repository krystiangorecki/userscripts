// ==UserScript==
// @name         r autologin
// @namespace    https://github.com/krystiangorecki/userscripts/r
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        https://www.r.pl/*
// @grant        none
// ==/UserScript==


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
    referenceNode.insertBefore(newNode, referenceNode.lastChild);
}

function exec() {
    debugger;
    var loginForm = document.querySelector("#login_top_form");
    if (loginForm != undefined) {
        addLoginButton("maeukemi");
        addLoginButton("maeukemi2");
    }
}

function addLoginButton(login) {
    var newLink = document.createElement("span");
    newLink.innerText = login;
    newLink.style="margin-left:10px"
    newLink.addEventListener("click", function(){doLogin(login)});
    var destination = document.querySelector('form>div');
    insertAsLastChild(destination, newLink);
}

function doLogin(login) {
    document.querySelector('#login_form_login').value=login;
    document.querySelector('form').submit();
}

(function() {
    'use strict';
    setTimeout(function(){ exec(); }, 10);
})();
