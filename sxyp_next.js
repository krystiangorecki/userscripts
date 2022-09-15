// ==UserScript==
// @name         sxyp load sizes and load next page
// @namespace    https://github.com/krystiangorecki/userscripts/
// @author       You
// @version      1.5
// @description  "You don't need to take all of the steps, only the next one."
// @match        https://sxyp/
// @match        https://sxyp/o/*
// @match        https://sxyp/*.html*
// @match        https://sxyp/
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// @connect      streamtape.com
// @connect      doodstream.com
// @connect      dood.wf
// @run-at       document-end
// ==/UserScript==

// v1.4 fixed redundant size loading for dynamically loaded pages
// v1.5 full external sizes loading with CORS bypass

GM_addStyle(' .post_text.green { color: #00dd00; }');
GM_addStyle(' .post_text.red { color: red; }');


var autoloadForEqualDurationTimes = true;
var autoloadWhiteSizes = true;
let map = new Map();
let mapEl = new Map();
var downloadPending = 0;
var nextPageNumber = 30;
var maxPage;
var pageUrl = window.location.href;

(function() {
    'use strict';

    initLoadNextPage();
    initLoadTimes();
    loadSizesOfExternalLinks();
})();

function loadSizesOfExternalLinks() {
    var allExternalLinks = document.querySelectorAll('.post_el_wrap div.post_text a.extlink');
    if (allExternalLinks.length > 0) {
        // single movie page, loading all at once
        loadSizesForAllExternalLinks(undefined, allExternalLinks);
    } else {
        // page with boxes, adding only listeners
        var allBoxes = document.querySelectorAll('div.post_text');
        allBoxes.forEach(box => {
            var externalLinksForThisBox = box.querySelectorAll('a.extlink');
            if (externalLinksForThisBox.length > 0) {
                box.addEventListener('mouseover', (event) => {loadSizesForAllExternalLinks(box, externalLinksForThisBox)});
            }
        });
    }
}

function loadSizesForAllExternalLinks(box, externalLinks) {
    if (box != undefined) {
        if (box.classList.contains('externalLinksSizesAlreadyLoaded')) {
            return;
        }
    }

    externalLinks.forEach(link => {
        var href = link.href;
        var selector;
        if (contains(href, 'ddownload.com')) {
            selector = 'span.file-size';
        } else if (contains(href, 'hexupload.net')) {
            selector = '.download-page';
        } else if (contains(href, 'rapidgator.net')) {
            selector = '.file-descr>div>div>strong';
        } else if (contains(href, 'streamtape.com')) {
            selector = '.subheading';
            httpGETWithCORSbypass(href, selector, link);
            return;
        } else if (contains(href, 'doodstream.com') || contains(href, 'dood.wf')) {
            selector = 'div.size';
            httpGETWithCORSbypass(href, selector, link);
            return;
        }

        if (selector==undefined) {
            return; //continue;
        }

        $.ajax ( {
            type:       'GET',
            url:        href,
            dataType:   'html',
            success:    function (data) {
                var $page = $(data);
                var $sizeElement = $page.find(selector);
                var size = $sizeElement.text();
                if (contains(href, 'hexupload.net')) {
                    size = size.substring(size.lastIndexOf('('));
                    size = getStringByRegex(size, /\((.+?)\)/i);
                }
                if (size.length==0) {
                    size = "-";
                }
                link.innerText = link.innerText + " " + size;
            },
            error:  function (data) {
                link.innerText = link.innerText + " x";
            }
        });
    });

    if (box != undefined) {
        box.classList.add('externalLinksSizesAlreadyLoaded');
    }
}

function httpGETWithCORSbypass(url, selector, link) {
    GM.xmlHttpRequest({
        method: "GET",
        url: url,
        onload: function(response) {
            var dom2 = htmlToElement(response.responseText);
            var size = dom2.querySelector(selector);
            size = size.innerText;
            link.innerText = link.innerText + " " + size;
        },
        // onerror: function(response) {
        //     console.log(response);
        // }
    });
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content;
}

function initLoadNextPage() {
    maxPage = getMaxPage();
    if (maxPage != undefined) {
        addLoadNextPageButton();
    }
}

function getMaxPage() {
    var pagination = document.querySelectorAll('#center_control a');
    if (pagination != undefined && pagination.length > 0) {
        var lastPageLink = pagination[pagination.length-1].href;
        var maxPage = getStringByRegex(lastPageLink, /(\d+)$/i);
        if (maxPage == undefined) {
            maxPage = getStringByRegex(lastPageLink, /page=(\d+)/i);
        }
        return maxPage;
    }
}

function addLoadNextPageButton() {
    var loadNextPageButton = document.createElement("input");
    loadNextPageButton.setAttribute("type", "button");
    loadNextPageButton.setAttribute("id", "nextPageButton");
    loadNextPageButton.setAttribute("style", "width:10%; position:absolute;right:0px");
    loadNextPageButton.onclick = loadNextPage;
    var destination = document.getElementsByClassName('main_content')[0];
    if (destination != undefined) {
        insertAsFirstChild(destination, loadNextPageButton);
        sgRefreshButtonNumber();
    }
}

function sgRefreshButtonNumber() {
    $('#nextPageButton').val("load " + nextPageNumber);
}

function loadNextPage() {
    blockButton();

    var indexOfPageParameter = pageUrl.indexOf('page=');
    if (indexOfPageParameter > 0) {
        pageUrl = pageUrl.substring(0,indexOfPageParameter);
    } else {
        var indexOfQuestionMark = pageUrl.indexOf('?');
        if (indexOfQuestionMark > 0) {
            pageUrl = pageUrl + '&';
        } else {
            pageUrl = pageUrl + '?';
        }
    }
    var nextPageUrl = pageUrl + 'page=' + nextPageNumber

    $.ajax ( {
        type:       'GET',
        url:        nextPageUrl,
        dataType:   'html',
        success:    function (data) {
            var $page = $(data);
            var $newElements = $page.find('.main_content .post_el_small');
            var $oldElements = $('.post_el_small');
            var $last = $oldElements.last();

            var indexesToRemove = [];
            // find existing ones in the new ones and save index to delete to avoid deleting while iterating
            $newElements.each(function(i, newItem) {
                if(newItem!=undefined) {
                    var newHref = $(newItem).find('a.js-pop').first().attr('href');
                    var newMovieId = getStringByRegex(newHref,/\/([0-9a-f]+)\.html/);
                    var exists = false;
                    $oldElements.each(function(j, old) {
                        var href = $(old).find('a.js-pop').first().attr('href');
                        var movieId = getStringByRegex(href,/\/([0-9a-f]+)\.html/);
                        // console.log('checking new vs old  ' + newMovieId + ' == ' + movieId );
                        if (newMovieId == movieId) {
                            exists = true;
                            indexesToRemove.push(i);
                        }
                    });
                    // console.log(' ' + newMovieId + ' exists? ' + exists + " as " + i);
                }
            });

            for (var i = indexesToRemove.length - 1 ; i>=0 ; i--) {
                $newElements.splice(i, 1);
            }
            $newElements.insertAfter($last);
            nextPageNumber+=30;
            if (nextPageNumber <= maxPage) {
                unblockButton();
                resetGreen();
                resetRed();
            } else {
                $('#nextPageButton').val("---");
            }

            //debugger;
            //reinitialize file sizes check
            initLoadTimes();

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


//---------- LOAD TIMES
function initLoadTimes() {
    var linesContainer = document.querySelector('#linesContainer');
    if (linesContainer != undefined) {
        linesContainer.outerHTML='';
    }
    linesContainer = document.createElement('div');
    linesContainer.id='linesContainer';
    linesContainer.innerText='';
    insertAsFirstChild(document.querySelector('body'), linesContainer);

    addSizesWhenBrowsing();
    if (autoloadForEqualDurationTimes) {
        // var startTime = performance.now();
        checkDurations();
        // var endTime = performance.now();
        // console.log(`searching names took ${endTime - startTime} ms`);
        addHideRedButton();
        setTimeout(clickHideRedButton, 1000);
        if (autoloadWhiteSizes) {
            setTimeout(loadWhiteSizes, 2000);
        }
    }
}

function clickHideRedButton() {
    var b = document.querySelector("#hideRed")
    b.click();
}

function addHideRedButton() {
    if (document.querySelector('.hide_red') != undefined) {
        return;
    }
    var newButton = document.createElement("button");
    newButton.setAttribute("style", "margin-left:10px; opacity:0.1;border: none; padding: 1px 3px; ");
    newButton.setAttribute("class", "hide_red");
    newButton.id="hideRed";
    newButton.innerText="hide red";
    newButton.addEventListener("mouseover", function() { hideRed() });
    newButton.addEventListener("click", function() { hideRed() });
    var destination = document.getElementsByClassName('splitter_block_header')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
    var tags = document.querySelectorAll('div.search_results a.htag_rel_a');
    destination = tags[tags.length-1];
    if (destination != undefined) {
        insertAfter(destination, newButton);
        return;
    }
    destination = document.getElementsByClassName('.blog_sort_div')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
}

function loadWhiteSizes() {
    var whiteButtons = document.querySelectorAll('.get_movie_size:not(.red)');
    whiteButtons.forEach(b => b.click());
}

function hideRed() {
    var redLabels = document.querySelectorAll('.red');
    redLabels.forEach(label => {label.parentElement.parentElement.style.opacity = '0.3'; label.classList.remove('red');} );
}

function resetRed() {
    var redLabels = document.querySelectorAll('.red');
    redLabels.forEach(label => {label.parentElement.parentElement.style.opacity = '1'; label.classList.remove('red');} );
}

function resetGreen() {
    var redLabels = document.querySelectorAll('.green');
    redLabels.forEach(label => label.classList.remove('green') );
}


function draw() {
    var boxes = document.querySelectorAll('.movieSize');
    map.forEach((sizes, duration) => {
        if (sizes.length == 1) {
            return;
        }
        var maxSize = getMaxNumber(sizes);
        var els = mapEl.get(duration);

        for (var i = 0 ; i < sizes.length ; i++) {
            if (maxSize == sizes[i]) {
                for (var j = 0 ; j < sizes.length ; j++) {
                    if (i == j) {
                        continue;
                    }
                    var lineClass = 'line'+duration.replaceAll(':','-');
                    drawLineBetween(els[i].getElementsByClassName('post_time')[0], els[j].getElementsByClassName('post_time')[0], lineClass);
                }
            }
        }
    });
}

function drawLineBetween(el1, el2, lineClass){
    var rect1 = el1.getBoundingClientRect();
    var rect2 = el2.getBoundingClientRect();
    var x1 = rect1.x+pageXOffset;
    var y1 = rect1.y+window.pageYOffset;
    var x2 = rect2.x+pageXOffset;
    var y2 = rect2.y+window.pageYOffset;
    if (x2 < x1) {
        var tmp;
        tmp = x2 ; x2 = x1 ; x1 = tmp;
        tmp = y2 ; y2 = y1 ; y1 = tmp;
    }
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    linedraw(x1, y1,x2, y2, lineClass);
    attachShowHideListeners(el1, el2, lineClass);
}

function attachShowHideListeners(el1, el2, lineClass){
    el1.addEventListener('mouseover', function handleMouseOver() {
        var lines = document.querySelectorAll('.' + lineClass);
        lines.forEach(line => line.style.display = 'block');
    });

    el1.addEventListener('mouseout', function handleMouseOut() {
        var lines = document.querySelectorAll('.' + lineClass);
        lines.forEach(line => line.style.display = 'none');
    });

    el2.addEventListener('mouseover', function handleMouseOver() {
        var lines = document.querySelectorAll('.' + lineClass);
        lines.forEach(line => line.style.display = 'block');
    });

    el2.addEventListener('mouseout', function handleMouseOut() {
        var lines = document.querySelectorAll('.' + lineClass);
        lines.forEach(line => line.style.display = 'none');
    });
}

function linedraw(x1, y1, x2, y2, lineClass) {
    if (x2 < x1) {
        var tmp;
        tmp = x2 ; x2 = x1 ; x1 = tmp;
        tmp = y2 ; y2 = y1 ; y1 = tmp;
    }
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    // console.log(`drawing from ${x1} ${x1} to ${x2} ${y2}`);
    var lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    var m = (y2 - y1) / (x2 - x1);
    var degree = Math.atan(m) * 180 / Math.PI;

    var destination = document.querySelector('#linesContainer');
    // console.log("creating line"+x1+y1+x2+y2);
    destination.innerHTML += "<div class='"+lineClass+"' style='display:none; position: absolute; z-index:10; transform-origin: top left; transform: rotate(" + degree + "deg); width: " + lineLength + "px; height: 2px; background: yellow; top: " + y1 + "px; left: " + x1 + "px;'></div>";

}

function checkDurations() {
    var hasResults = document.querySelector('.page_message');
    if (hasResults != undefined && hasResults.innerText.indexOf('Nothing Found')>-1) {
        return;
    }

    var boxes = document.querySelectorAll('div.post_el_small');
    if (boxes.length == 0) {
        return ;
    }
    for (var i = 0 ; i<boxes.length ; i++) {
        var found = false;
        var el = boxes[i];
        var durationBox = el.querySelector('.duration_small');
        if (durationBox == null) {
            continue;
        }
        var duration = durationBox.innerText;
        for (var j = i+1 ; j<boxes.length ; j++) {
            if (i == j) {
                continue;
            }
            var el2 = boxes[j];
            var durationBox2 = el2.querySelector('.duration_small');
            if (durationBox2 == null) {
                continue;
            }
            var duration2 = durationBox2.innerText;
            //console.log('checking ' + duration + ' == ' + duration2);
            if (duration == duration2) {
                if (el2.querySelector('.movieSize')!=undefined) {
                    var button2 = el2.querySelector('.get_movie_size');
                    if (button2 != undefined) {
                        found = true;
                        button2.click();
                    }
                }
            }
        }
        if (found) {
            if (el2.querySelector('.movieSize')!=undefined) {
                var button = el.querySelector('.get_movie_size');
                if (button != undefined) {
                    button.click();
                }
            }
        }
    }
}

function addSizesWhenBrowsing() {
    var boxes = document.querySelectorAll('div.post_el_small');
    if (boxes.length == 0) {
        return ;
    }
    var selStartTime, selEndTime;
    //selStartTime = performance.now();
    boxes.forEach(el => {
        if(el.querySelector('.movieSize') == undefined){
            addButtonToGetMovieSize(el);
        }
    });
    //selEndTime = performance.now();
}


function addButtonToGetMovieSize(el) {
    var referenceNode = el.getElementsByClassName('post_time')[0];
    if (referenceNode == undefined) {
        return;
    }
    var getMovieSizeButtonAlreadyExists = el.getElementsByClassName('get_movie_size');
    if (getMovieSizeButtonAlreadyExists.length > 0) {
        //skip adding another button when "load next" is clicked too fast
        return;
    }
    var newButton = document.createElement("button");
    newButton.setAttribute("style", "margin-left:10px; opacity:0.1;border: none; padding: 1px 3px; ");
    newButton.setAttribute("class", "get_movie_size");
    newButton.innerText="get";
    newButton.addEventListener("mouseover", function() { go(el) });
    newButton.addEventListener("click", function() { go(el) });
    insertAfter(referenceNode, newButton);
}

function go(el) {
    var moviePageUrl = el.querySelector('a.js-pop').href;
    downloadGetMovieSizeAndAddNewElement(moviePageUrl, el);
}

function setMovieSize(movieSize, el) {
    var movieSizeElement = createTextElement(movieSize + ' MB');
    var destination = el.getElementsByClassName('post_time')[0];
    movieSizeElement.classList.add('movieSize');
    movieSizeElement.classList.add('highlightme' + movieSize.replace(':',''));
    insertAfter(destination, movieSizeElement);
}

function downloadGetMovieSizeAndAddNewElement(moviePageUrl, el) {
    downloadPending++;
    removeButton(el);
    $.ajax ( {
        type:       'GET',
        url:         moviePageUrl,
        dataType:   'html',
        success:    function (data) {
            var $page = $(data);
            var movieSize = $page.find('div.post_control').first().prev().text();
            const regex = /size:(\d+)/i;
            var match = regex.exec(movieSize);
            if (match == undefined) {
                setMovieSize('---', el);
            } else {
                setMovieSize(match[1], el);
                addResultToMap(el, match[1]);
            }
            downloadPending--;
            if (downloadPending == 0) {
                // last download finished
                highlightBiggestMovieSizes();
                setTimeout (draw, 500);
            }
        }
    } );
}

function addResultToMap(el, size) {
    var duration = el.getElementsByClassName('duration_small')[0].innerText;
    size = parseInt(size);
    if (map.has(duration)) {
        map.get(duration).push(size);
    } else {
        map.set(duration, [size]);
    }
    if (mapEl.has(duration)) {
        mapEl.get(duration).push(el);
    } else {
        mapEl.set(duration, [el]);
    }
}

function highlightBiggestMovieSizes() {
    map.forEach((sizes, duration) => {
        if (sizes.length == 1) {
            return;
        }
        var maxSize = getMaxNumber(sizes);
        var els = mapEl.get(duration);

        for (var i = 0 ; i < sizes.length ; i++) {
            if (maxSize == sizes[i]) {
                els[i].querySelector('.movieSize').classList.add('green');
            } else {
                els[i].querySelector('.movieSize').classList.add('red');
            }
        }
    });
}

function getMaxNumber(sizes) {
    var maxNum = 0;
    for (var i = 0 ; i < sizes.length ; i++) {
        if (sizes[i] > maxNum) {
            maxNum = sizes[i];
        }
    }
    return maxNum;
}

function getIndexOfMaxNumber(sizes) {
    var maxNum = 0;
    var maxIndex = 0;
    for (var i = 0 ; i < sizes.length ; i++) {
        if (sizes[i] > maxNum) {
            maxNum = sizes[i];
            maxIndex = i;
        }
    }
    return maxIndex;
}

function removeButton(el) {
    el.getElementsByClassName('get_movie_size')[0].remove();
}

function createTextElement(text) {
    var newElement = document.createElement("span");
    newElement.setAttribute("class", "post_text");
    newElement.setAttribute("style", "margin-left:10px;");
    newElement.innerText=text;
    return newElement;
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

//* returns first capturing group */
function getStringByRegex(text, regex){
    var match = regex.exec(text);
    if (match == null) {
        return undefined;
    }
    var result = match[1];
    return result;
}

function contains(haystack, needle){
    return haystack.indexOf(needle) > -1;
}
