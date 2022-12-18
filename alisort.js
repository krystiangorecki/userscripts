// ==UserScript==
// @name         aliexpress shop sort, alisort
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://pl.aliexpress.com/store/5744374/search/*
// @match        https://pl.aliexpress.com/store/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=aliexpress.com
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    addButtonToSort();
    //setTimeout(doSort,500);
})();

function addButtonToSort() {

    var insertAfterElement = document.querySelector('.result-info');
    var buttonId = "mySortButton";
    var customStyle = 'color: #FF0000; margin-left: 20px; font-weight: 1000; font-size: 20px;';
    var newbutton = addButtonAfter(' SORT ', '', buttonId, '', customStyle, insertAfterElement);

    newbutton.addEventListener('click', function(event) {
        doSort();
    });
}

function doSort() {
    debugger;
/*
// https://stackoverflow.com/questions/6133723/sort-divs-in-jquery-based-on-attribute-data-sort
   sposób pierwszy działa, ale drugi sposób zachowuje eventy js (które i tak nie są tu problemem)

    var boxes = $('.product-container .JIIxO>a');
    var result = boxes.sort(function (a, b) {

      var contentA =parseInt( $(a).find('.mGXnE').text());
      var contentB =parseInt( $(b).find('.mGXnE').text());
      return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
   });

   $('.product-container .JIIxO').html(result);
*/
    var $container = $('#node-gallery ul.items-list').first();
    var $boxes = $('#node-gallery .items-list>.item');
    $boxes.sort(function (a, b) {

      var contentA = parseInt( $(a).find('.cost>b').text().replace(',','') );
      var contentB = parseInt( $(b).find('.cost>b').text().replace(',','') );
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
