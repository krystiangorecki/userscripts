// ==UserScript==
// @name         pyszne.pl sort
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.pyszne.pl/na-dowoz/jedzenie/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pyszne.pl
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant        none
// ==/UserScript==

 

(function() {
    'use strict';
    setTimeout(addButtonToSort, 300);
})();

 

 

function addButtonToSort() {
    debugger;
    var insertAfterElement = document.querySelector('span[data-qa="search-tooltip"]');
    var buttonId = "mySortButton";
    var customStyle = 'color: #FF0000; margin-left: 20px; font-weight: 1000; font-size: 15px;';
    var newbutton = addButtonAfter(' SORT ', '', buttonId, '', customStyle, insertAfterElement);
    newbutton.addEventListener('click', function(event) {
        doSort();
    });
}

 

 

function doSort() {
    debugger;
    var $container = $('div[role="main"] section ul').first();
    var $boxes = $('div[role="main"] section ul>li');
    $boxes.sort(function (a, b) {
        var contentA = parseInt( $(a).find('div[data-qa="mov-indicator-content"]').text().replaceAll(/[A-Za-z,. ]/g,'') );
        var contentB = parseInt( $(b).find('div[data-qa="mov-indicator-content"]').text().replaceAll(/[A-Za-z,. ]/g,'') );
        return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
    }).prependTo($container);
}

 

 


function addButtonAfter(label, href, buttonId, buttonClass, style, insertAfterElement) {
    var newbutton = document.createElement("a");
    newbutton.text = label;
    if (href!=undefined && href.length>0) {
        newbutton.setAttribute("href", href);
    }
    if (buttonId!=undefined && buttonId.length>0) {
        newbutton.setAttribute("id", buttonId);
    }
    if (buttonClass!=undefined && buttonClass.length>0) {
        newbutton.setAttribute("class", buttonClass);
    }
    if (style!=undefined && style.length>0) {
        newbutton.setAttribute("style", style);
    }
    insertAfterElement.parentNode.insertBefore(newbutton, insertAfterElement.nextSibling);
    return newbutton;
}
