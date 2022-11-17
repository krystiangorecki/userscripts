// ==UserScript==
// @name         sxyp load sizes and load next page
// @namespace    https://github.com/krystiangorecki/userscripts/
// @author       You
// @version      1.85
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
// @connect      dood.re
// @connect      upvideo.to
// @connect      highload.to
// @run-at       document-end
// ==/UserScript==
// v1.4 fixed redundant size loading for dynamically loaded pages
// v1.5 full external sizes loading with CORS bypass
// v1.6 delayed line disappearance
// v1.7 fixed HTTP error handling
// v1.7 handling links with two urls where only one of them contains movie size (streamtape, doodstream)
// v1.7 handling pages with two forms where each of them contains size but selector is different (hexupload)
// v1.7 added upvideo.to
// v1.8 lines with gradients, optimized loading sizes for next pages
// v1.81 fixed handling of Not Found for dood
// v1.82 dood.re + hexupload fixes
// v1.83 nice icons with size above title
// v1.84 highload.to
// v1.85 hidered() by mistake removed red class
// TODO clickable icons



GM_addStyle(' .post_text.green { color: #00dd00; }');
GM_addStyle(' .post_text.red { color: red; }');
GM_addStyle(' .a_name {  letter-spacing: -1px;  }');
GM_addStyle(' .pes_author_div { color: #6ddede; font-size: 10px; letter-spacing: -1px; }');
GM_addStyle(' .pes_author_div .a_name {font-size:9px; margin-left:0px}');

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

var imgTemplate = '<img src="https://www1.ddownload.com/images/favicon.ico" style="height: 16px">';

function loadSizesOfExternalLinks() {

    var isSingleMoviePage = document.querySelector(".post_el_wrap") != undefined;

    if (isSingleMoviePage) {
        // single movie page, loading all at once
        var allExternalLinks = document.querySelectorAll('.post_el_wrap div.post_text a.extlink');
        allExternalLinks.forEach((link, index) => {
            var href = link.href;
            addIconWithoutSize(undefined, href, index);
        });
        loadSizesForAllExternalLinks(undefined, allExternalLinks);
    } else {
        // page with boxes, adding only listeners
        var allBoxes = document.querySelectorAll('div.post_text');
        allBoxes.forEach(box => {
            var externalLinksForThisBox = box.querySelectorAll('a.extlink');
            if (externalLinksForThisBox.length > 0) {
                externalLinksForThisBox.forEach((link, index) => {
                    var href = link.href;
                    addIconWithoutSize(box, href, index);
                });
                box.parentElement.addEventListener('mouseover', (event) => {loadSizesForAllExternalLinks(box, externalLinksForThisBox)});
            }
        });
    }
}

function addSizeToIcon(box, href, size, index) {

    var movieId = getMovieId(box);
    var iconId = '#icon' + index + '-' + movieId;

    var iconElement = document.querySelector(iconId);
    var sizeElement = document.createElement("span");

    size = size.replace('B','');
    if(contains(size, '.')){
        // cut number after the decimal point if it's MB, but skip for GB
        if(contains(size, 'M')){
            size = size.replace(/\.\d+/,'');
        }
    }
    sizeElement.textContent = size;
    insertAfter(iconElement, sizeElement);
}

function getContainer(box) {
    var container;
    var singleMoviePage = box == undefined;
    if (singleMoviePage) {
        container = document;
    } else {
        container = box.parentElement;
    }
    return container;
}

function getMovieId(box) {
    var container = getContainer(box);
    var movieHref= container.querySelector('a.js-pop').href;
    var movieId = getStringByRegex(movieHref,/\/([0-9a-f]+)\.html/);
    return movieId;
}

function addIconWithoutSize(box, href, index) {

    var movieId = getMovieId(box);
    var container = getContainer(box);
    var uploaderName = container.querySelector('.a_name');

    var newEl;
    var iconId = "icon" + index + '-' + movieId;
    if (contains(href, "sbembed")) {
        newEl = createIconImg("https://sbembed.com/favicon.ico", iconId);
        insertAsLastChild(uploaderName.parentElement.parentElement, newEl);
    }
    if (contains(href, "ddownload")) {
        newEl = createIconImg("http://ddownload.com/favicon.ico", iconId);
        insertAsLastChild(uploaderName.parentElement.parentElement, newEl);
    }
    if (contains(href, "dood")) {
        newEl = createIconImg("http://doodstream.com/favicon.ico", iconId);
        insertAsLastChild(uploaderName.parentElement.parentElement, newEl);
    }
    if (contains(href, "rapidgator")) {
        newEl = createIconImg("http://www.google.com/s2/favicons?domain=rapidgator.net", iconId);
        insertAsLastChild(uploaderName.parentElement.parentElement, newEl);
    }
    if (contains(href, "hexupload")) {
        newEl = createIconImg("http://www.google.com/s2/favicons?domain=hexupload.net", iconId);
        insertAsLastChild(uploaderName.parentElement.parentElement, newEl);
    }
    if (contains(href, "streamtape")) {
        newEl = createIconImg("http://www.google.com/s2/favicons?domain=streamtape.com", iconId);
        insertAsLastChild(uploaderName.parentElement.parentElement, newEl);
    }
    if (contains(href, "highload")) {
        newEl = createIconImg("https://highload.to/favicon.svg", iconId);
        insertAsLastChild(uploaderName.parentElement.parentElement, newEl);
    }
    if (contains(href, "upvideo")) {
        newEl = createIconImg("https://upvideo.to/favicon.ico", iconId);
        insertAsLastChild(uploaderName.parentElement.parentElement, newEl);
    }
}

function createIconImg(src, id) {
    var newImg = document.createElement("img");
    newImg.src = src;
    newImg.id = id;
    newImg.style = 'height: 16px; margin-left:3px; margin-right:0px;color:#6ddede';
    return newImg;
}

function loadSizesForAllExternalLinks(box, externalLinks) {
    if (box != undefined) {
        if (box.classList.contains('externalLinksSizesAlreadyLoaded')) {
            return;
        }
    }

    externalLinks.forEach((link, index) => {
        var href = link.href;
        var selector;
        if (contains(href, 'ddownload.com')) {
            selector = 'span.file-size';
        } else if (contains(href, 'hexupload.net')) {
            selector = ['span.h3.text-danger','.download-page'];
        } else if (contains(href, 'rapidgator.net')) {
            selector = '.file-descr>div>div>strong';
        } else if (contains(href, 'highload.to')) {
            selector = '.subheading';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'streamtape.com')) {
            selector = '.subheading';
            href = href.replace('/e/','/v/');
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'upvideo.to')) {
            selector = '.size-f';
            href = href.replace('/e/','/v/');
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'doodstream.com') || contains(href, 'dood.wf')) {
            selector = 'div.size';
            href = href.replace('/e/','/d/');
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        }

        if (selector==undefined) {
            return; //continue;
        }

        var linkText = link.innerText;
        link.innerText = linkText + " ...";

        $.ajax ( {
            type:       'GET',
            url:        href,
            dataType:   'html',
            success:    function (data) {
                var $page = $(data);
                var $sizeElement;
                if (selector instanceof Array) {
                    var i=0;
                    do {
                        $sizeElement = $page.find(selector[i++]);
                    } while($sizeElement.length==0 && i<selector.length);
                } else {
                    $sizeElement = $page.find(selector);
                }

                var size = $sizeElement.text();
                if (contains(href, 'hexupload.net')) {
                    if (contains(size, '(')) {
                        size = size.substring(0, size.lastIndexOf('B)') + 2);
                        size = size.substring(size.lastIndexOf('('));
                        size = getStringByRegex(size, /\((.+?)\)/i);
                    }
                }
                if (size.length==0 || contains(size, 'File Not Found')) {
                    size = "-";
                }
                link.innerText = linkText + " " + size;

                addSizeToIcon(box, href, size, index);

            },
            error:  function (data) {
                console.log("error for " + href);
                link.innerText = linkText + " error!";
            }
        });
    });

    if (box != undefined) {
        box.classList.add('externalLinksSizesAlreadyLoaded');
    }
}

function httpGETWithCORSbypass(url, selector, link, box, index) {
    var linkText = link.innerText;
    link.innerText = linkText + " ...";
    GM.xmlHttpRequest({
        method: "GET",
        url: url,
        onload: function(response) {
            var dom2 = htmlToElement(response.responseText);
            var size = dom2.querySelector(selector);
            if (size != null) {
                size = size.innerText;
                size = size.trim();
                size = size.replace('(','').replace(')','');
                if (size.length == 0 || contains(size, 'Earn money') || contains(size, 'File Not Found') || contains(size, 'deleted')) {
                    size = "-";
                }
            } else {
                size = "-";
            }
            link.innerText = linkText + " " + size;
            addSizeToIcon(box, link.href, size, index);
        },
        ontimeout: function(response) {
            console.log('ontimeout');
            link.innerText = linkText + " timeout!";
        },
        onerror: function(response) {
            link.innerText = linkText + " error: " + response.error;
            console.log(response);
        },
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
                if (newItem!=undefined) {
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
            resetGreen();
            resetRed();
            //reinitialize file sizes check
            initLoadTimes();
            if (nextPageNumber > maxPage) {
                $('#nextPageButton').val("---");
            } else {
                unblockButton();
            }
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
        // setTimeout(clickHideRedButton, 1000);
        if (autoloadWhiteSizes) {
            setTimeout(loadWhiteSizes, 2500);
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
    redLabels.forEach(label => {label.parentElement.parentElement.style.opacity = '0.3'; } );
}

function resetRed() {
    var redLabels = document.querySelectorAll('.red');
    redLabels.forEach(label => {label.parentElement.parentElement.style.opacity = '1'; label.classList.remove('red'); } );
}

function resetGreen() {
    var redLabels = document.querySelectorAll('.green');
    redLabels.forEach(label => label.classList.remove('green') );
}


function draw() {
    map.forEach((sizes, duration) => {
        if (sizes.length == 1) {
            return;
        }
        var maxSize = getMaxNumber(sizes);
        var els = mapEl.get(duration);
        var lineClass = 'line'+duration.replaceAll(':','-');
        for (var i = 0 ; i < sizes.length ; i++) {
            if (sizes[i] == maxSize) {
                for (var j = 0 ; j < sizes.length ; j++) {
                    if (i == j) {
                        continue;
                    }

                    var bothSizesAreMaxSize = false;
                    if (sizes[j] == maxSize) {
                        bothSizesAreMaxSize = true;
                    }
                    drawLineBetween(els[i].getElementsByClassName('post_time')[0], els[j].getElementsByClassName('post_time')[0], lineClass, bothSizesAreMaxSize);
                }
            }
        }
    });
}

function drawLineBetween(el1, el2, lineClass, noGradient) {
    var rect1 = el1.getBoundingClientRect();
    var rect2 = el2.getBoundingClientRect();
    var x1 = rect1.x+pageXOffset;
    var y1 = rect1.y+window.pageYOffset;
    var x2 = rect2.x+pageXOffset;
    var y2 = rect2.y+window.pageYOffset;
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    linedraw(x1, y1, x2, y2, lineClass, noGradient);
    attachShowHideListeners(el1, el2, lineClass);
}

function attachShowHideListeners(el1, el2, lineClass) {
    el1.addEventListener('mouseover', function handleMouseOver() {
        var lines = document.querySelectorAll('.' + lineClass);
        lines.forEach(line => {line.style.display = 'block'});
    });

    el1.addEventListener('mouseout', function handleMouseOut() {
        var lines = document.querySelectorAll('.' + lineClass);
        setTimeout(function() {lines.forEach(line => {line.style.display = 'none'});}, 1500);
    });

    el2.addEventListener('mouseover', function handleMouseOver() {
        var lines = document.querySelectorAll('.' + lineClass);
        lines.forEach(line => {line.style.display = 'block'});
    });

    el2.addEventListener('mouseout', function handleMouseOut() {
        var lines = document.querySelectorAll('.' + lineClass);
        setTimeout(function() {lines.forEach(line => {line.style.display = 'none'});}, 1500);
    });
}

function linedraw(x1, y1, x2, y2, lineClass, noGradient) {
    var switchGradientDirection = false;
    if (x2 < x1) {
        var tmp;
        tmp = x2 ; x2 = x1 ; x1 = tmp;
        tmp = y2 ; y2 = y1 ; y1 = tmp;
        switchGradientDirection = true;
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
    var backgroundCSS;
    if (noGradient == true) {
        backgroundCSS = 'background: yellow;';
    } else {
        if (switchGradientDirection) {
            backgroundCSS = 'background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,255,0,1) 100%);';
        } else {
            backgroundCSS = 'background: linear-gradient(90deg, rgba(255,255,0,1) 0%, rgba(255,0,0,1) 100%);';
        }
    }
    destination.innerHTML += "<div class='"+lineClass+"' style='display: none; position: absolute; z-index:10; transform-origin: top left; transform: rotate(" + degree + "deg); width: " + lineLength + "px; height: 3px; " + backgroundCSS + " top: " + y1 + "px; left: " + x1 + "px;'></div>";

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
        if (el.querySelector('.movieSize') == undefined) {
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
function getStringByRegex(text, regex) {
    var match = regex.exec(text);
    if (match == null) {
        return undefined;
    }
    var result = match[1];
    return result;
}

function contains(haystack, needle) {
    return haystack.indexOf(needle) > -1;
}
