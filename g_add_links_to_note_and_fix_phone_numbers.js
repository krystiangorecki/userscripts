// ==UserScript==
// @name     g add links to note and fix phone numbers
// @namespace  http://tampermonkey.net/
// @version   0.2
// @description try to take over the world!
// @author    You
// @match    https://www.g.com.pl/forum/topic/*
// @grant    none
// ==/UserScript==

var esc = decodeURIComponent('%70%6c%2e%65%73%63%6f%72%74%2e%63%6c%75%62');
var esc2 = decodeURIComponent('%65%73%63%6f%72%74%2e%70%6c');

(function() {
    'use strict';
    executeAddLinksToNote();
    executeReplaceSpaceSeparatedPhoneNumbers();
})();


function executeReplaceSpaceSeparatedPhoneNumbers() {
    var posts = document.querySelectorAll('div.post, div.post_date+span');
    posts.forEach( function(post) { fixPhoneNumberInPostContent(post); });
}

function fixPhoneNumberInPostContent(post) {
    post.innerHTML = post.innerHTML.replace(/(\d\d\d) (\d\d\d) (\d\d\d)/,'$1-$2-$3');
}

function executeAddLinksToNote() {
    var links = document.querySelectorAll('a.bbc_url');
    links.forEach( function(link) { addENoteLink(link); });
}

function addENoteLink(link) {
    var href = link.href;
    if (href.includes(esc) || href.includes(esc2)) {
        var adId = getStringByRegex(href, /(\d+)\.htm/);
        var newHref = 'https://' + esc + '/action.php?action=addUserNote&id=' + adId;
        addLinkAfter('🗨', newHref, null, null, null, link);
    }
}

//* returns first capturing group */
function getStringByRegex(text, regex) {
    var match = regex.exec(text);
    if (match == null) {
        return undefined;
    }
    var result = match[1];
    return result;
}

function addLinkAfter(label, href, buttonId, buttonClass, style, destination) {
    var newbutton = document.createElement("a");
    newbutton.text = label;
    if (href != undefined && href.length>0) {
        newbutton.setAttribute("href", href);
    }
    if (buttonId != undefined && buttonId.length>0) {
        newbutton.setAttribute("id", buttonId);
    }
    if (buttonClass != undefined && buttonClass.length>0) {
        newbutton.setAttribute("class", buttonClass);
    }
    if (style != undefined && style.length>0) {
        newbutton.setAttribute("style", style);
    }
    insertAfter(destination, newbutton);
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
