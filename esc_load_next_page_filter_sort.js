// ==UserScript==
// @name         esc, load next page + filter + sort
// @namespace    https://github.com/krystiangorecki/userscripts/
// @version      0.25
// @description  try to take over the world!
// @author       You
// @match        https://pl.esc*/anonse/*
// @connect      pl.esc
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

var nextPageURL = initNextPageURL();
var nextPageNumber = initNextPageNumber();
var autoloadAllPages = false;
var counterElement;

GM_addStyle(' .hidden { display:none; }');

(function() {
    //'use strict'; wykomentowane, bo inicjuję new LazyLoad z istniejącego skryptu
    addHideNotWorkingNowButton();
    addSortByPriceButton();
    addSortByNameButton();
    addLoadAllPagesButton();
    addLoadNextPageButton();
    addFilterInput();
    initCounterElement();
})();

function addSortByNameButton() {
    var sortButton = document.createElement("input");
    sortButton.setAttribute("type", "button");
    sortButton.setAttribute("id", "sortByNameButton");
    sortButton.setAttribute("style", "margin-left:10px");
    sortButton.onclick = sortByName;
    sortButton.value = ' by name ';
    insertAfter(document.querySelector('.title-col>h1'), sortButton);
}

function addSortByPriceButton() {
    var sortButton = document.createElement("input");
    sortButton.setAttribute("type", "button");
    sortButton.setAttribute("id", "sortByPriceButton");
    sortButton.setAttribute("style", "margin-left:10px");
    sortButton.onclick = sortByPrice;
    sortButton.value = ' by price ';
    insertAfter(document.querySelector('.title-col>h1'), sortButton);
}

function addHideNotWorkingNowButton() {
    var sortButton = document.createElement("input");
    sortButton.setAttribute("type", "button");
    sortButton.setAttribute("id", "hideNotWorkingNowButton");
    sortButton.setAttribute("style", "margin-left:10px");
    sortButton.onclick = hideNotWorkingNow;
    sortButton.value = ' hide not working now ';
    insertAfter(document.querySelector('.title-col>h1'), sortButton);
}

function hideNotWorkingNow(){
    //var startTime = performance.now();
    var $haystack = $('.content-sec>.wrapper>div.row');
    var $container = $(".item-col", $haystack).first().parent();
    var $elements = $container.children();

    $elements.each(function(index) {
        var workingNow = $(this).find('.-title:contains(teraz TAK)').length>0;
        if (!workingNow) {
            $(this).remove();
        }
    });
    updateCounter();

    //var endTime = performance.now();
    //console.log(`hideNotWorkingNow took ${endTime - startTime} ms`);
}

function sortByPrice(){
    //var startTime = performance.now();
    var $haystack = $('.content-sec>.wrapper>div.row');
    var $container = $(".item-col", $haystack).first().parent();
    var $elements = $container.children();

    $elements.sort(function(a, b) {
        return $(a).find('.-title>.-content').text().toLowerCase().localeCompare($(b).find('.-title>.-content').text().toLowerCase());
    });

    $container.empty();
    $container.append($elements);
    //var endTime = performance.now();
    //console.log(`sortByPrice took ${endTime - startTime} ms`);
}

function sortByName(){
    //var startTime = performance.now();
    var $haystack = $('.content-sec>.wrapper>div.row');
    var $container = $(".item-col", $haystack).first().parent();
    var $elements = $container.children();

    $elements.sort(function(a, b) {
        return $(a).find('.item-name').text().toLowerCase().localeCompare($(b).find('.item-name').text().toLowerCase());
    });

    $container.empty();
    $container.append($elements);
    //var endTime = performance.now();
    //console.log(`sortByName took ${endTime - startTime} ms`);
}

function initCounterElement() {
    counterElement = document.createElement("span");
    counterElement.setAttribute("id", "counterElement");
    counterElement.setAttribute("style", "margin-left:40px");
    insertAfter(document.querySelector('.title-col>h1'), counterElement);
    updateCounter();
}

function updateCounter() {
    counterElement.innerText = countElements() + "/" + getSearchResultCount();
}

function countElements() {
    return document.querySelectorAll('.content-sec .item-col').length;
}

function getSearchResultCount() {
    var elements = document.querySelectorAll('.ads-nav>p>strong');
    var summary = elements[elements.length-1];
    return summary.innerText;
}

function addLoadNextPageButton() {
    var loadNextPageButton = document.createElement("input");
    loadNextPageButton.setAttribute("type", "button");
    loadNextPageButton.setAttribute("id", "nextPageButton");
    loadNextPageButton.setAttribute("style", "margin-left:40px");
    loadNextPageButton.onclick = loadNextPage;
    loadNextPageButton.value = ' load ' + nextPageNumber + ' ';
    insertAfter(document.querySelector('.title-col>h1'), loadNextPageButton);
}

function addLoadAllPagesButton() {
    var loadAllPagesButton = document.createElement("input");
    loadAllPagesButton.setAttribute("type", "button");
    loadAllPagesButton.setAttribute("id", "loadAllPagesButton");
    loadAllPagesButton.setAttribute("style", "margin-left:40px");
    loadAllPagesButton.onclick = loadAllPages;
    loadAllPagesButton.value = ' load all pages ';
    insertAfter(document.querySelector('.title-col>h1'), loadAllPagesButton);
}

function loadAllPages() {
    document.querySelector('#loadAllPagesButton').remove();
    autoloadAllPages = true;
    loadNextPage();
}

function refreshButtonNumber(nextPageNumber) {
    document.querySelector('#nextPageButton').value = " load " + nextPageNumber;
}

function initNextPageURL() {
    return document.querySelector('a.next').href;
}

function initNextPageNumber() {
    return getNextPageNumber(nextPageURL);
}

function getNextPageNumber(url) {
    var result;
    var regex = /page(\d+).html/;
    let match = regex.exec(url);
    if (match != undefined) {
        result = parseInt(match[1]);
        return result;
    } else {
        result = 2;
        return result;
    }
}

function loadNextPage() {
    blockButton();
    if (nextPageURL.indexOf('undefined') > 0) {
        debugger;
    }
    $.ajax ( {
        type:       'GET',
        url:        nextPageURL,
        dataType:   'html',
        success:    function (data) {
            var $page = $(data);
            var $elements = $page.find('.content-sec .item-col');
            var $last = $('.content-sec .item-col').last();
            $elements.insertAfter($last);
            updateCounter();
            nextPageURL = $page.find('a.next').first().attr('href');
            if (nextPageURL != undefined) {
                nextPageURL = window.location.hostname + window.location.pathname + nextPageURL;
                if (!nextPageURL.startsWith('http')) {
                    nextPageURL = 'https://' + nextPageURL;
                }
                refreshButtonNumber(getNextPageNumber(nextPageURL));
                unblockButton();
                if (autoloadAllPages) {
                    loadNextPage();
                }
            } else {
                showNoMorePagesButton();
                autoloadAllPages = false;
            }

            var lazyLoadInstance = new LazyLoad({
                elements_selector: ".lazy"
            });
            doFilter();

        }
    } );
}

function blockButton() {
    var button = $('#nextPageButton').first();
    button.css('text-decoration','line-through');
    button.attr('disabled','');
}

function unblockButton() {
    var button = $('#nextPageButton').first();
    button.css('text-decoration','');
    button.removeAttr('disabled');
}

function showNoMorePagesButton() {
    $('#nextPageButton').remove();
    $('#loadAllPagesButton').remove();
}

//------------- filtering

function addFilterInput() {
    var filterInput = document.createElement("input");
    filterInput.setAttribute("id", "filterInput");
    filterInput.setAttribute("style", "margin-left:40px");
    filterInput.oninput = doFilter;
    insertAfter(document.querySelector('.title-col>h1'), filterInput);
    addClearFilterInput();
}

function addClearFilterInput() {
    var clearFilterInput = document.createElement("input");
    clearFilterInput.setAttribute("type", "button");
    clearFilterInput.value="x";
    clearFilterInput.setAttribute("style", "margin-left:10px");
    clearFilterInput.onclick = function(){ document.querySelector('#filterInput').value=""; showAll(); };
    insertAfter(document.querySelector('#filterInput'), clearFilterInput);
}

function doFilter(e) {
    var startTime, endTime;
    // startTime = performance.now();
    var text = document.getElementById('filterInput').value.trim().toLowerCase();
    if (text.trim().length==0) {
        showAll();
        return;
    }
    var texts = text.split(' ');
    var boxes = document.querySelectorAll('section.content-sec .item-col');
    // endTime = performance.now();
    // console.log(`getting all boxes took ${endTime - startTime} ms`);
    // startTime = performance.now();
    var selectionTimeSum = 0;
    var selStartTime, selEndTime;
    boxes.forEach(el => {
        // selStartTime = performance.now();
        var nameWithAge = el.getElementsByClassName('item-info')[0].innerText.toLowerCase();
        // selEndTime = performance.now();
        // selectionTimeSum += (selEndTime-selStartTime);
        var allMatches = true;
        for (var i = 0; i < texts.length ; i++) {
            var singleMatch = nameWithAge.indexOf(texts[i])>-1;
            allMatches = allMatches && singleMatch;
        }
        if (!allMatches) {
            el.classList.add('hidden');
        } else {
            el.classList.remove('hidden');
        }
    }
                 );
    // endTime = performance.now();
    // console.log(`selecting boxes took ${selectionTimeSum} ms`);
    // console.log(`searching names took ${endTime - startTime} ms`);
}

function showAll() {
    document.querySelectorAll('.content-sec .item-col.hidden').forEach(el => {
        el.classList.remove('hidden');
    });
}

//------------- common

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
