// ==UserScript==
// @name         sxyp load sizes and load next page
// @namespace    https://github.com/krystiangorecki/userscripts/
// @author       You
// @description  "You don't need to take all of the steps, only the next one."
// @match        https://sxyp*/
// @match        https://sxyp*/o/*
// @match        https://sxyp*/*.html*
// @match        https://sxyp*.net/
// @match        https://sxyp*.net/o/*
// @match        https://sxyp*.net/*.html*
// @version      2.23
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// @connect      streamtape.com
// @connect      dood.re
// @connect      dood.so
// @connect      dood.com
// @connect      doodstream.com
// @connect      doodstream.com.
// @connect      dood.to
// @connect      doodapi.com
// @connect      dooood.com
// @connect      dood.watch
// @connect      dood.cx
// @connect      doodstream.co
// @connect      dood.la
// @connect      dood.ws
// @connect      dood.pm
// @connect      dood.sh
// @connect      dood.one
// @connect      dood.tech
// @connect      dood.wf
// @connect      dood.yt
// @connect      dood.li
// @connect      dood.work
// @connect      d0o0d.com
// @connect      do0od.com
// @connect      d0000d.com
// @connect      d000d.com
// @connect      dooodster.com
// @connect      ds2play.com
// @connect      doods.pro
// @connect      upvideo.to
// @connect      highload.to
// @connect      rapidgator.net
// @connect      filefactory.com
// @connect      upfilesurls.com
// @connect      upfiles.com
// @connect      rapidcloud.cc
// @connect      fikper.com
// @connect      wolfstream.tv
// @connect      embedrise.com
// @connect      vidmoly.to
// @connect      vidmoly.me
// @connect      megaup.net
// @connect      frdl.to
// @connect      iceyfile.com
// @connect      iceyfile.net
// @connect      send.cm
// @connect      vidguard.to
// @connect      go-streamer.net
// @connect      listeamed.net
// @run-at       document-end
// ==/UserScript==
/* globals jQuery, $, waitForKeyElements */
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
// v1.86 unrecognized hostings + optimized
// v1.87 autofix some links from /e/ to /d/ to see the filesizes
// v1.88 new hostings
// v1.89 progress numbers updated for multiple pages
// v1.90 handled rapidgator error
// v1.91 fixed problem with multiple sizes loaded at once
// v1.92 sorting by time+size or by size, loading pages on *asm/ pages
// v1.93 sorting fix to keep sorting bar at the top, removing old lines before drawing the new ones
// v1.94 sorting including external sizes
// v1.95 button to load all exteral sizes
// v1.95 fixed class selector
// v1.96 updating streamhub.to links with original http size
// v1.97 added k2s icon
// v1.98 load next page button also at the bottom
// v1.99 convert filefactory string to link
// v2.00 convert upfiles string to link + upfiles icon + size loading
// v2.01 added rapidcloud.cc, fikper only icon, streamvid only icon
// v2.02 convert filefactory string to link
// v2.03 updating wolfstream.tv and filelions.to links with original http size
// v2.04 fixed /e/ -> /d/ for dood and its alternatives
// v2.05 fixed alternative movie link
// v2.06 tricky fikper size loading by posting json
// v2.07 embedrise.com
// v2.08 wolfstream.tv size
// v2.09 megaup.net size
// v2.10 frdl.to size
// v2.11 iceyfile.com
// v2.12 iceyfile.net
// v2.13 fixed wolfstream size
// v2.14 send.cm
// v2.15 some premium checks
// v2.16 more send.cm
// v2.17 media.cm icon
// v2.18 vidguard/listeamed
// v2.19 clickable time copies link to clipboard
// v2.20 redraw lines on window resize
// v2.21 redundant <template> removal
// v2.21 using 'let'
// v2.22 partially fixed paging for isTopViewed
// v2.23 fixed NPE


GM_addStyle(' .post_text.green { color: #00dd00; }');
GM_addStyle(' .post_text.red { color: red; }');
GM_addStyle(' .post_text.grey { color: #5C5053; }');
GM_addStyle(' .a_name {  letter-spacing: -1px;  }');
GM_addStyle(' .pes_author_div { color: #6ddede; font-size: 10px; letter-spacing: -1px; }');
GM_addStyle(' .pes_author_div .a_name {font-size:9px; margin-left:0px}');

let autoloadForEqualDurationTimes = true;
let autoloadWhiteSizes = true;
let map = new Map();
let mapEl = new Map();
let downloadPending = 0;
let nextPageNumber = 30;
let maxPage;
let pageUrl = window.location.href;

(function() {
    'use strict';

    addVerticalProgressNumbers();
    initLoadNextPage();

    initLoadTimes();
    loadSizesOfExternalLinks();
    addLoadExternalButton();

    addButtonToSortByTimeAndSizeIncludingExternals();
    addButtonToSortByTimeAndSize();
    addButtonToSortBySize();
    makeTimeElementCopyLinkToClipboard();
})();


function addButtonToSortByTimeAndSizeIncludingExternals() {
    let newButton = document.createElement("a");
    newButton.id="mySortButton1";
    newButton.text=" sort ext ";
    newButton.setAttribute("style", 'color: #FF0000; margin-left: 20px; font-weight: 1000; font-size: 12px;');

    newButton.addEventListener('click', function(event) {
        removeVerticalProgressNumbers();
        doSortExternal();
        resetGreen();
        resetRed();
        addVerticalProgressNumbers();
        if (downloadPending == 0) {
            highlightBiggestMovieSizes();
            setTimeout(draw, 500);
        }
    });

    let destination = document.getElementsByClassName('splitter_block_header')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
    let tags = document.querySelectorAll('div.search_results a.htag_rel_a');
    destination = tags[tags.length-1];
    if (destination != undefined) {
        insertAfter(destination, newButton);
        return;
    }
    destination = document.getElementsByClassName('blog_sort_div')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
}

function addButtonToSortByTimeAndSize() {
    let newButton = document.createElement("a");
    newButton.id="mySortButton1";
    newButton.text=" by title, time, size ";
    newButton.setAttribute("style", 'color: #FF0000; margin-left: 20px; font-weight: 1000; font-size: 12px;');

    newButton.addEventListener('click', function(event) {
        removeVerticalProgressNumbers();
        doSortByTitleContainingSearchPhraseTimeAndSize();
        resetGreen();
        resetRed();
        addVerticalProgressNumbers();
        if (downloadPending == 0) {
            highlightBiggestMovieSizes();
            setTimeout (draw, 500);
        }
    });

    let destination = document.getElementsByClassName('splitter_block_header')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
    let tags = document.querySelectorAll('div.search_results a.htag_rel_a');
    destination = tags[tags.length-1];
    if (destination != undefined) {
        insertAfter(destination, newButton);
        return;
    }
    destination = document.getElementsByClassName('blog_sort_div')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
}

function addButtonToSortBySize() {
    let newButton = document.createElement("a");
    newButton.id="mySortButton2";
    newButton.text=" sort by size ";
    newButton.setAttribute("style", 'color: #FF0000; margin-left: 20px; font-weight: 1000; font-size: 12px;');

    newButton.addEventListener('click', function(event) {
        doSortBySize();
        resetGreen();
        resetRed();
        addVerticalProgressNumbers();
        if (downloadPending == 0) {
            highlightBiggestMovieSizes();
            setTimeout (draw, 500);
        }
    });

    let destination = document.getElementsByClassName('splitter_block_header')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
    let tags = document.querySelectorAll('div.search_results a.htag_rel_a');
    destination = tags[tags.length-1];
    if (destination != undefined) {
        insertAfter(destination, newButton);
        return;
    }
    destination = document.getElementsByClassName('blog_sort_div')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
}

function doSortExternal() {
    let $container = $('div.post_el_small').first().parent();
    let $boxes = $('div.post_el_small');
    $boxes.sort(function (b, a) {
        let sizeElementsA = $(a).find('.movieSize,.extSize');
        sizeElementsA = sizeElementsA.map(function() { return parseInt(this.innerText.replace(' M','000').replace(' G','000000').replaceAll(/[A-Z .]/g,'')) }).filter(function() { return this>0 });
        let maxSizeA = Math.max(...sizeElementsA);

        let sizeElementsB = $(b).find('.movieSize,.extSize');
        sizeElementsB = sizeElementsB.map(function() { return parseInt(this.innerText.replace(' M','000').replace(' G','000000').replaceAll(/[A-Z .]/g,'')) }).filter(function() { return this>0 });
        let maxSizeB = Math.max(...sizeElementsB);
        // console.log(maxSizeA + ' ' + maxSizeB);
        if (maxSizeA < maxSizeB) return -1;
        if (maxSizeA > maxSizeB) return 1;
        return 0;
    }).prependTo($container);
    $container.children().last().detach().prependTo($container);
}

function doSortBySize() {
    let $container = $('div.post_el_small').first().parent();
    let $boxes = $('div.post_el_small');
    $boxes.sort(function (b, a) {
        let sizeA = parseInt( $(a).find('.movieSize ').text().replaceAll(/[A-Z ]/,'') );
        let sizeB = parseInt( $(b).find('.movieSize ').text().replaceAll(/[A-Z ]/,'') );
        if (sizeA < sizeB) return -1;
        if (sizeA > sizeB) return 1;
        return 0;
    }).prependTo($container);
    $container.children().last().detach().prependTo($container);
}

function doSortByTitleContainingSearchPhraseTimeAndSize() {
    let searchPhrase = $('input#se_in').val().toLowerCase();
    let $container = $('div.post_el_small').first().parent();
    let $boxes = $('div.post_el_small');
    $boxes.sort(function (b, a) {
        let titleA = $(a).find('.post_text').text().replaceAll('  ',' ').toLowerCase();
        let titleB = $(b).find('.post_text').text().replaceAll('  ',' ').toLowerCase();
        let hasA = titleA.includes(searchPhrase);
        let hasB = titleB.includes(searchPhrase);
        if (hasA < hasB) return -1;
        if (hasA > hasB) return 1;

        let contentA = parseInt( $(a).find('.duration_small').text().replaceAll(':','') );
        let contentB = parseInt( $(b).find('.duration_small').text().replaceAll(':','') );
        console.log(contentA + ' ' + contentB);
        if (contentA < contentB) return -1;
        if (contentA > contentB) return 1;

        // equal time, compare sizes
        let sizeA = parseInt( $(a).find('.movieSize ').text().replaceAll(/[A-Z ]/,'') );
        let sizeB = parseInt( $(b).find('.movieSize ').text().replaceAll(/[A-Z ]/,'') );
        if (sizeA < sizeB) return -1;
        if (sizeA > sizeB) return 1;

        return 0;
    }).prependTo($container);
    $container.children().last().detach().prependTo($container);
}


function doSortByTimeAndSize() {
    let $container = $('div.post_el_small').first().parent();
    let $boxes = $('div.post_el_small');
    $boxes.sort(function (b, a) {
        let contentA = parseInt( $(a).find('.duration_small').text().replaceAll(':','') );
        let contentB = parseInt( $(b).find('.duration_small').text().replaceAll(':','') );
        console.log(contentA + ' ' + contentB);
        if (contentA < contentB) return -1;
        if (contentA > contentB) return 1;
        // equal time, compare sizes
        let sizeA = parseInt( $(a).find('.movieSize ').text().replaceAll(/[A-Z ]/,'') );
        let sizeB = parseInt( $(b).find('.movieSize ').text().replaceAll(/[A-Z ]/,'') );
        if (sizeA < sizeB) return -1;
        if (sizeA > sizeB) return 1;
        return 0;
    }).prependTo($container);
    $container.children().last().detach().prependTo($container);
}

function removeVerticalProgressNumbers() {
    let existingNumbers = document.querySelectorAll('.progressNumber');
    for (let number of existingNumbers) {
        number.remove();
    }
}

function addVerticalProgressNumbers() {

    removeVerticalProgressNumbers();

    let boxes = document.querySelectorAll('div.post_el_small');
    for (let i = 1 ; i < boxes.length ; i++) {
        if ((i+1)%3 == 0) {
            let newEl = document.createElement("span");
            newEl.innerText = '' + (i+1);
            newEl.classList.add('progressNumber');
            insertAfter(boxes[i], newEl);
        }
    }
}

function loadSizesOfExternalLinks() {
    let postBoxes = document.querySelectorAll(".post_el_wrap");
    let isSingleMoviePage = postBoxes.length == 1;
    let isBlogPage = postBoxes.length >1;

    if (isSingleMoviePage || isBlogPage) {
        // single movie page or blog page, loading all at once
        postBoxes.forEach(postBox => {
            if (postBox.classList.contains('externalIconsAdded')) {
                return;
            }
            postBox.classList.add('externalIconsAdded');
            let postText = postBox.querySelector('.post_el_wrap div.post_text');
            convertFilefactoryTextToLink(postText);
            convertUpfilesTextToLink(postText);
            convertFilelionsTextToLink(postText);
            convertEmbedriseTextToLink(postText);
            let allExternalLinks = postText.querySelectorAll('a.extlink');
            if (allExternalLinks.length > 0) {
                let movieId = getMovieId(postBox);
                let uploaderName = postBox.querySelector('.a_name');
                let destinationElement = uploaderName.parentElement.parentElement;
                allExternalLinks.forEach((link, index) => {
                    let href = link.href;
                    addIconWithoutSize(movieId, href, index, destinationElement);
                });
            }
            updateStreamhubToHrefForSingleMoviePage(postBox);
            loadSizesForAllExternalLinks(postBox, allExternalLinks);
        });
    } else {
        // page with boxes, adding only listeners
        let allBoxes = document.querySelectorAll('div.post_text');
        allBoxes.forEach(box => {
            if (box.classList.contains('externalIconsAdded')) {
                return;
            }
            box.classList.add('externalIconsAdded');
            convertFilefactoryTextToLink(box);
            convertUpfilesTextToLink(box);
            convertFilelionsTextToLink(box);
            convertEmbedriseTextToLink(box);
            let externalLinksForThisBox = box.querySelectorAll('a.extlink');
            if (externalLinksForThisBox.length > 0) {
                externalLinksForThisBox.forEach((link, index) => {
                    let href = link.href;
                    let movieId = getMovieId(box);
                    let container = getContainer(box);
                    let uploaderName = container.querySelector('.a_name');
                    let destinationElement = uploaderName.parentElement.parentElement;
                    addIconWithoutSize(movieId, href, index, destinationElement);
                });
                box.parentElement.addEventListener('mouseover', (event) => {loadSizesForAllExternalLinks(box, externalLinksForThisBox)});
            }
        });
    }
    addResizeListener();
}

function addResizeListener() {
    window.addEventListener('resize', function() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        console.log(`Window resized to: ${width}x${height}`);
        draw();
    });
}

/** Czasami linki do filefactory.com nie są linkami a zwyklym tekstem. Podmieniam je na link jeszcze przed dodaniem ikon i rozmiarów. */
function convertFilefactoryTextToLink(postText){
    if (contains(postText.innerText, 'https://www.filefactory.com')) {
        let url = getStringByRegex(postText.innerText, /(https:\/\/www\.filefactory\.com\/file\/[a-z0-9]+)/);
        postText.innerHTML = postText.innerHTML.replace(url, '<a href="'+url+'" target="_blank" rel="nofollow" title=">External Link!<" class="extlink_icon extlink">filefactory.com</a>');
    }
}
function convertUpfilesTextToLink(postText){
    if (contains(postText.innerText, ' upfiles.com')) {
        let url = getStringByRegex(postText.innerText, /(upfiles\.com\/f\/[a-zA-Z0-9]+)/);
        postText.innerHTML = postText.innerHTML.replace(url, '<a href="'+url+'" target="_blank" rel="nofollow" title=">External Link!<" class="extlink_icon extlink">upfiles.com</a>');
    }
}
function convertFilelionsTextToLink(postText){
    if (contains(postText.innerText, 'filelions.to')) {
        let url = getStringByRegex(postText.innerText, /(https:\/\/filelions\.to\/v\/[a-zA-Z0-9]+)/);
        postText.innerHTML = postText.innerHTML.replace(url, '<a href="'+url+'" target="_blank" rel="nofollow" title=">External Link!<" class="extlink_icon extlink">filelions.to</a>');
    }
}
function convertEmbedriseTextToLink(postText){
    if (contains(postText.innerText, 'embedrise.com')) {
        let url = getStringByRegex(postText.innerText, /(https:\/\/embedrise\.com\/d\/[a-zA-Z0-9]+)/);
        postText.innerHTML = postText.innerHTML.replace(url, '<a href="'+url+'" target="_blank" rel="nofollow" title=">External Link!<" class="extlink_icon extlink">embedrise.com</a>');
    }
}

function addSizeToIcon(box, href, size, index) {

    let movieId = getMovieId(box);
    let iconId = '#icon' + index + '-' + movieId;

    let iconElement = document.querySelector(iconId);
    let sizeElement = document.createElement("span");
    sizeElement.classList.add('extSize');

    size = size.replace('B','');
    if (contains(size, '.')) {
        // truncate number after the decimal point if it's MB, but skip for GB
        if (contains(size, 'M')) {
            size = size.replace(/\.\d+/,'');
        }
    }
    sizeElement.textContent = size;
    insertAfter(iconElement, sizeElement);
}

function getContainer(box, singleMoviePage) {
    let container;
    if (singleMoviePage) {
        container = document;
    } else {
        container = box.parentElement;
    }
    return container;
}

function getMovieId(box) {
    let el = box.querySelector('div[data-postid]');
    if (el != undefined) {
        let movieIdFromData = el.dataset.postid;
        if (movieIdFromData != undefined) {
            return movieIdFromData;
        }
    }
    let movieLink = box.parentElement.querySelector('a.js-pop');
    if (movieLink == undefined) {
        movieLink = box.parentElement.querySelector('.post_control>a');
    }
    let movieHref = movieLink.href;
    let movieId = getStringByRegex(movieHref,/\/([0-9a-f]+)\.html/);
    return movieId;
}

function addIconWithoutSize(movieId, href, index, destinationElement) {

    let newEl;
    let iconId = "icon" + index + '-' + movieId;
    if (contains(href, "sbembed")) {
        newEl = createIconImg("https://sbembed.com/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "ddownload")) {
        let iconLink = "http://ddownload.com/favicon.ico";
        if (contains(href, 'p6zkh48nakez')) {
            iconLink = 'https://via.placeholder.com/16/f00?text=%20';
        }
        newEl = createIconImg(iconLink, iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "dood")) {
        newEl = createIconImg("http://www.google.com/s2/favicons?domain=doodstream.com", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "rapidgator")) {
        newEl = createIconImg("http://www.google.com/s2/favicons?domain=rapidgator.net", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "hexupload")) {
        newEl = createIconImg("http://www.google.com/s2/favicons?domain=hexupload.net", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "streamtape")) {
        newEl = createIconImg("http://www.google.com/s2/favicons?domain=streamtape.com", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "highload")) {
        newEl = createIconImg("https://highload.to/favicon.svg", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "vtube.to")) {
        newEl = createIconImg("https://vtube.to/src/img-min/logo/favicon.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "vtbe.to")) {
        newEl = createIconImg("https://vtbe.to/src/img-min/logo/favicon.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "upvideo")) {
        newEl = createIconImg("https://upvideo.to/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "filemoon")) {
        newEl = createIconImg("https://filemoon.sx/assets/images/favicon/favicon-16x16.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "streamz.ws")) {
        newEl = createIconImg("https://streamz.ws/g/favicon-16x16.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "streamcrypt.net")) {
        newEl = createIconImg("https://streamcrypt.net/logo.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "streamhub.to") || contains(href, "streamhub.gg")) {
        newEl = createIconImg("https://streamhub.to/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "k2s.cc")) {
        newEl = createIconImg("https://k2s.cc/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "filefactory.com")) {
        newEl = createIconImg("https://www.filefactory.com/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "upfiles.com")) {
        newEl = createIconImg("https://upfilesurls.com/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "rapidcloud.cc")) {
        newEl = createIconImg("https://rapidcloud.cc/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "fikper.com")) {
        newEl = createIconImg("https://fikper.com/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "streamvid.net")) {
        newEl = createIconImg("https://streamvid.net/img/favicon-16x16.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "wolfstream.tv")) {
        newEl = createIconImg("https://wolfstream.tv/xfst_images/wolfstream.tv3.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "filelions.to")) {
        newEl = createIconImg("https://filelions.to/theme/images/favicon/favicon-16x16.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "vidmoly.to") || contains(href, "vidmoly.me")) {
        newEl = createIconImg(" https://vidmoly.to/img/faviconm.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "embedrise.com")) {
        newEl = createIconImg("https://embedrise.com/assets/images/ico/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "megaup.net")) {
        newEl = createIconImg("https://megaup.net/themes/flow/frontend_assets/images/icons/favicon/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "frdl.to")) {
        newEl = createIconImg("https://frdl.to/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "iceyfile.com")) {
        newEl = createIconImg("https://iceyfile.com/themes/spirit/assets/frontend/img/favicon/favicon-16x16.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "iceyfile.net")) {
        newEl = createIconImg("http://www.google.com/s2/favicons?domain=iceyfile.net", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "send.cm")) {
        newEl = createIconImg("http://www.google.com/s2/favicons?domain=iceyfile.net", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "media.cm")) {
        newEl = createIconImg("https://media.cm/favicon-32.png", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else if (contains(href, "vidguard.to")) {
        newEl = createIconImg("https://listeamed.net/assets/img/favicon.ico", iconId);
        insertAsLastChild(destinationElement, newEl);
    } else {
        newEl = document.createTextNode("[?]");
        insertAsLastChild(destinationElement, newEl);
    }
}

function createIconImg(src, id) {
    let newImg = document.createElement("img");
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
        let href = link.href;
        let selector;
        if (contains(href, 'ddownload.com')) {
            selector = 'span.file-size, h2>font:last-child';
        } else if (contains(href, 'hexupload.net')) {
            selector = ['span.h3.text-danger','.download-page'];
        } else if (contains(href, 'rapidgator.net')) {
            selector = '.file-descr>div>div>strong';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'highload.to')) {
            selector = '.subheading';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'streamtape.com')) {
            selector = '.subheading';
            href = href.replace('/e/','/v/');
            // fix to show filesizes
            link.href = href;
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'upvideo.to')) {
            selector = '.size-f';
            href = href.replace('/e/','/v/');
            // fix to show filesizes
            link.href = href;
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'dood.re') || contains(href, 'dood.so') || contains(href, 'doodstream.com') || contains(href, 'dood.to') || contains(href, 'doodapi.com') || contains(href, 'dood.watch') || contains(href, 'dood.cx') || contains(href, 'doodstream.co') || contains(href, 'dood.la') || contains(href, 'dood.ws') || contains(href, 'dood.pm') || contains(href, 'dood.sh') || contains(href, 'dood.one') || contains(href, 'dood.tech') || contains(href, 'dood.wf') || contains(href, 'dood.yt')|| contains(href, 'dood.com')|| contains(href, 'dooood.com') || contains(href, 'doods.pro')) {
            selector = 'div.size';
            href = href.replace('/e/','/d/');
            // fix to show filesizes
            link.href = href;
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'filefactory.com')) {
            selector = '#file_info';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'upfiles.com')) {
            selector = 'h3';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'rapidcloud.cc')) {
            selector = '#container div.name > span:nth-child(3)';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'embedrise.com')) {
            selector = 'i.bx-save + strong';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'wolfstream.tv')) {
            selector = '.tbl1 td:nth-child(2), form#F1 > button';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'megaup.net')) {
            selector = '.responsiveInfoTable';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'frdl.to')) {
            selector = '.container .name>span';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'iceyfile.com')) {
            selector = '.responsiveInfoTable strong';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'iceyfile.net')) {
            selector = '#oyraid_app_toolbar_container .text-white.fw-bold.fs-3.mb-1';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'vidguard.to')) {
            selector = '.btn-light';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'fikper.com')) {
            selector = undefined;
            let fileHash = href;
            if (contains(fileHash, '#')) {
                fileHash = fileHash.substring(0, fileHash.indexOf('#'));
            }
            if (contains(fileHash, '?')) {
                fileHash = fileHash.substring(0, fileHash.indexOf('?'));
            }
            fileHash = fileHash.substring(fileHash.indexOf('fikper.com/') + 11);
            let data = '{"fileHashName":"' + fileHash + '"}';
            href = 'https://sapi.fikper.com/'
            httpPOSTWithCORSbypass(href, selector, link, box, index, data);
            return;
        } else if (contains(href, 'filelions.to')) {
            href = href.replace('/v/','/f/');
            // fix to show filesizes
            link.href = href;
            return;
        } else if (contains(href, '//vidmoly.to') || contains(href, '//vidmoly.me')) {
            href = href.replace('vidmoly.me','vidmoly.to');
            if (contains(href, '/w/')) {
                let movieId = getStringByRegex(href, /\/w\/(.+)/);
                href = 'https://vidmoly.to/' + movieId + '.html';
            }
            if (contains(href, 'https://vidmoly.to/embed-')) {
                let movieId = getStringByRegex(href, /\/embed-(.+?)\.html/);
                href = 'https://vidmoly.to/' + movieId + '.html';
            }
            selector = '#video-content .vid-d .box a';
            link.href = href;
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        } else if (contains(href, 'send.cm')) {
            selector = '#downloadbtn';
            httpGETWithCORSbypass(href, selector, link, box, index);
            return;
        }

        if (selector == undefined) {
            return; //continue;
        }

        let linkText = link.innerText;
        link.innerText = linkText + " ...";

        $.ajax ( {
            type:       'GET',
            url:        href,
            dataType:   'html',
            success:    function (data) {
                let $page = $(data);
                let $sizeElement;
                if (selector instanceof Array) {
                    let i=0;
                    do {
                        $sizeElement = $page.find(selector[i++]);
                    } while($sizeElement.length == 0 && i < selector.length);
                } else {
                    $sizeElement = $page.find(selector);
                }

                let size = $sizeElement.text();
                if (contains(href, 'hexupload.net')) {
                    if (contains(size, '(')) {
                        size = size.substring(0, size.lastIndexOf('B)') + 2);
                        size = size.substring(size.lastIndexOf('('));
                        size = getStringByRegex(size, /\((.+?)\)/i);
                    }
                }
                if (size.length == 0 || contains(size, 'File Not Found')) {
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
    let linkText = link.innerText;
    link.innerText = linkText + " ...";
    GM.xmlHttpRequest({
        method: "GET",
        url: url,
        onload: function(response) {
            let template = htmlToElement(response.responseText);
            let dom2 = template.content;
            let size = dom2.querySelector(selector);
            if (size != null) {
                size = size.innerText;
                size = size.trim();
                if (contains(url, 'upfiles.com')) {
                    size = size.replace(/.*\(/, '(');
                } else if (contains(url, 'iceyfile.com')) {
                    size = size.replace(/.*\(/, '(');
                } else if (contains(url, 'wolfstream.tv')) {
                    let needle = "\n";
                    size = size.substring(size.lastIndexOf (needle) + needle.length);
                }
                size = size.replace('Size', '');
                size = size.replace('[', '').replace(']', '')
                size = size.replace('Download', '');
                size = size.replace('(','').replace(')','');
                if (size.length == 0 || contains(size, 'Earn money') || contains(size, 'File Not Found') || contains(size, 'deleted')) {
                    size = "-";
                }
                if (contains(url, 'filefactory.com')) {
                    size = size.replace(/ uploaded.*/, '');
                } else if (contains(url, 'embedrise.com')) {
                    size = size.replace(',', '').replace('.',',');
                } else if (contains(url, 'megaup.net')) {
                    let needle = ": ";
                    size = size.substring(size.lastIndexOf (needle) + needle.length);
                }
                // premium check
                if (contains(url, 'rapidgator.net')) {
                    let table = dom2.querySelector("#table_header");
                    if (table.innerText.includes("Premium")) {
                        size = size + '[P]';
                    }
                }
            } else {
                size = "-";
                // premium check
                if (contains(url, 'frdl.to')) {
                    let table = dom2.querySelector("#container .err");
                    if (table.innerText.includes("Premium Users only")) {
                        size = '[P]';
                    }
                }
                if (contains(url, 'send.cm')) {
                    let table = dom2.querySelector(".container .alert-warning");
                    if (table.innerText.includes("Premium Users")) {
                        size = '[P]';
                    }
                }
            }
            link.innerText = linkText + " " + size;
            addSizeToIcon(box, link.href, size, index);
            template.innerHTML = '';
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

function httpPOSTWithCORSbypass(url, selector, link, box, index, data) {
    let linkText = link.innerText;
    link.innerText = linkText + " ...";
    GM.xmlHttpRequest({
        method: "POST",
        url: url,
        data: data,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Referer": url,
        },
        onload: function(response) {
            if (selector!=undefined) {
                let dom2 = htmlToElement(response.responseText);
                let size = dom2.querySelector(selector);
                if (size != null) {
                    size = size.innerText;
                    size = size.trim();
                    size = size.replace('Size', '');
                    size = size.replace('(','').replace(')','');
                    if (size.length == 0 || contains(size, 'Earn money') || contains(size, 'File Not Found') || contains(size, 'deleted')) {
                        size = "-";
                    }
                    if (contains(url, 'filefactory.com')) {
                        size = size.replace(/ uploaded.*/, '');
                    }
                } else {
                    size = "-";
                }
            } else {
                if (contains(url, 'fikper.com')) {
                    size = getStringByRegex(response.responseText, /"size":"(\d+)",/);
                    size = parseInt(parseInt(size)/1024/1024) + " MB";
                }
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
    let template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template;
}

function initLoadNextPage() {
    maxPage = getMaxPage();
    if (maxPage != undefined) {
        addLoadNextPageButtonAtTheTop();
        addLoadNextPageButtonAtTheBottom();
    }
}

function getMaxPage() {
    let pagination = document.querySelectorAll('#center_control a');
    if (pagination != undefined && pagination.length > 0) {
        let lastPageLink = pagination[pagination.length-1].href;
        let maxPage = getStringByRegex(lastPageLink, /(\d+)$/i);
        if (maxPage == undefined) {
            maxPage = getStringByRegex(lastPageLink, /page=(\d+)/i);
        }
        return maxPage;
    }
}

function addLoadNextPageButtonAtTheTop() {
    let loadNextPageButton = document.createElement("input");
    loadNextPageButton.setAttribute("type", "button");
    loadNextPageButton.setAttribute("class", "nextPageButton");
    loadNextPageButton.setAttribute("style", "width:10%; position:absolute;right:0px");
    loadNextPageButton.onclick = loadNextPage;

    let destination = document.getElementsByClassName('main_content')[0];
    if (destination != undefined) {
        insertAsFirstChild(destination, loadNextPageButton);
        updateButtonNumber();
    }
}

function addLoadNextPageButtonAtTheBottom() {
    let loadNextPageButton = document.createElement("input");
    loadNextPageButton.setAttribute("type", "button");
    loadNextPageButton.setAttribute("class", "nextPageButton");
    loadNextPageButton.setAttribute("style", "width:50%; background-color:#262932; color: #FFC3FA");
    loadNextPageButton.onclick = loadNextPage;

    let destination = document.querySelector('#center_control');
    if (destination != undefined) {
        insertBefore(destination, loadNextPageButton);
        updateButtonNumber();
    }
}

function updateButtonNumber() {
    $('.nextPageButton').each(function() {
        $(this).val("load " + nextPageNumber);
    });
}

function loadNextPage() {
    blockButton();
    let isAsmPage = /asm\/(\d+)?$/.exec(pageUrl) != null;
    let isTopViewedPage = /\/top-viewed.html\/?(\d+)?$/.exec(pageUrl) != null;
    let nextPageUrl;
    let indexOfPageParameter = pageUrl.indexOf('page=');
    if (isAsmPage) {
        nextPageUrl = pageUrl.substring(0, pageUrl.lastIndexOf('/')+1) + nextPageNumber;
    } else if (isTopViewedPage) {
        if (pageUrl.endsWith('.html')) {
            nextPageUrl = pageUrl + '/' + nextPageNumber;
        } else {
            // TODO parse number from URL, add 30 and set as nextPageNumber because currently i always loads first page (30)
            //  let currentPage = getStringByRegex(lastPageLink, /(\d+)$/i);
            nextPageUrl = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1) + nextPageNumber;
        }
    } else {
        if (indexOfPageParameter > 0) {
            pageUrl = pageUrl.substring(0, indexOfPageParameter);
        } else {
            let indexOfQuestionMark = pageUrl.indexOf('?');
            if (indexOfQuestionMark > 0) {
                pageUrl = pageUrl + '&';
            } else {
                pageUrl = pageUrl + '?';
            }
        }
        nextPageUrl = pageUrl + 'page=' + nextPageNumber
    }

    $.ajax ( {
        type:       'GET',
        url:        nextPageUrl,
        dataType:   'html',
        success:    function (data) {
            let $page = $(data);
            let $newElements = $page.find('.main_content .post_el_small');
            let $oldElements = $('.post_el_small');
            let $last = $oldElements.last();

            let indexesToRemove = [];
            // find existing ones in the new ones and save index to delete to avoid deleting while iterating
            $newElements.each(function(i, newItem) {
                if (newItem != undefined) {
                    let movieLink = $(newItem).find('a.js-pop').first();
                    if (movieLink == undefined) {
                        movieLink = $(newItem).find('.post_control>a').first();
                    }
                    let newHref = movieLink.attr('href');
                    let newMovieId = getStringByRegex(newHref,/\/([0-9a-f]+)\.html/);
                    let exists = false;
                    // console.log("new movie id " + newMovieId);
                    $oldElements.each(function(j, old) {
                        let href = $(old).find('a.js-pop').first().attr('href');
                        if (href == undefined) {
                            href = $(old).find('.post_control>a').first().attr('href');
                        }
                        let movieId = getStringByRegex(href,/\/([0-9a-f]+)\.html/);
                        // console.log('checking new vs old  ' + newMovieId + ' == ' + movieId);
                        if (newMovieId == movieId) {
                            exists = true;
                            indexesToRemove.push(i);
                        }
                    });
                    // console.log(' ' + newMovieId + ' exists? ' + exists + " as " + i);
                }
            });
            for (let i = indexesToRemove.length - 1 ; i>=0 ; i--) {
                $newElements.splice(i, 1);
            }
            $newElements.insertAfter($last);
            nextPageNumber+=30;
            resetGreen();
            resetRed();
            //reinitialize file sizes check
            initLoadTimes();
            loadSizesOfExternalLinks();
            addVerticalProgressNumbers();
            if (nextPageNumber > maxPage) {
                $('.nextPageButton').each(
                    function() {
                        $( this ).val("---");
                    });
            } else {
                unblockButton();
            }

            $oldElements = $('.post_el_small');
            // from old elements remove boxes found on the main page
            if (isAsmPage) {
                findMovieIdsPresentOnMainPage($oldElements);
            }
        }
    } );
}

function findMovieIdsPresentOnMainPage($oldElements){

    let idsFromTheFirstPage = [];
    $.ajax ( {
        type:       'GET',
        url:        window.location.origin,
        dataType:   'html',
        success:    function (data) {
            let $page = $(data);
            let $newElements = $page.find('.main_content .post_el_small');
            let indexesToRemove = [];
            $newElements.each(function(i, newItem) {
                if (newItem != undefined) {
                    let movieLink = $(newItem).find('a.js-pop').first();
                    if (movieLink == undefined) {
                        movieLink = $(newItem).find('.post_control>a').first();
                    }
                    let newHref = movieLink.attr('href');
                    let movieId = getStringByRegex(newHref,/\/([0-9a-f]+)\.html/);
                    idsFromTheFirstPage.push(movieId);
                }
            });

            let oldIndexesToRemove = [];
            $oldElements.each(function(i, oldItem) {
                $(idsFromTheFirstPage).each(function(j, fromFirst) {
                    let exists = false;
                    let href = $(oldItem).find('a.js-pop').first().attr('href');
                    if(href == undefined) {
                        href = $(oldItem).find('.post_control>a').first().attr('href');
                    }
                    let oldMovieId = getStringByRegex(href,/\/([0-9a-f]+)\.html/);
                    // console.log('checking first vs oldMovieId  ' + fromFirst + ' == ' + oldMovieId);
                    if (fromFirst == oldMovieId) {
                        exists = true;
                        oldIndexesToRemove.push(i);
                    }
                });
            });
            for (let i = oldIndexesToRemove.length - 1; i >= 0; i--) {
                let indexToRemove = oldIndexesToRemove[i];
                $oldElements.get(indexToRemove).firstElementChild.firstElementChild.classList.add('red');
                // $oldElements.get(indexToRemove).innerHTML = '';
            }
            clickHideRedButton();
        }
    } );
}

function blockButton() {
    $('.nextPageButton').each(
        function() {
            $( this ).css('text-decoration','line-through');
            $( this ).attr('disabled','');
        });
}

function unblockButton() {
    $('.nextPageButton').each(
        function() {
            $( this ).css('text-decoration','');
            $( this ).removeAttr('disabled');
        });
}


//---------- LOAD TIMES
function initLoadTimes() {
    let linesContainer = document.querySelector('#linesContainer');
    if (linesContainer != undefined) {
        linesContainer.outerHTML='';
    }
    linesContainer = document.createElement('div');
    linesContainer.id='linesContainer';
    linesContainer.innerText='';
    insertAsFirstChild(document.querySelector('body'), linesContainer);

    addSizesWhenBrowsing();
    if (autoloadForEqualDurationTimes) {
        // let startTime = performance.now();
        checkDurations();
        // let endTime = performance.now();
        // console.log(`searching names took ${endTime - startTime} ms`);
        addHideRedButton();
        // setTimeout(clickHideRedButton, 1000);
        if (autoloadWhiteSizes) {
            setTimeout(loadWhiteSizes, 200);
        }
    }
}

function clickHideRedButton() {
    let b = document.querySelector("#hideRed")
    b.click();
}

function addHideRedButton() {
    if (document.querySelector('.hide_red') != undefined) {
        return;
    }
    let newButton = document.createElement("button");
    newButton.setAttribute("style", "margin-left:10px; opacity:0.1;border: none; padding: 1px 3px; ");
    newButton.setAttribute("class", "hide_red");
    newButton.id="hideRed";
    newButton.innerText="hide red";
    newButton.addEventListener("mouseover", function() { hideRed() });
    newButton.addEventListener("click", function() { hideRed() });
    let destination = document.getElementsByClassName('splitter_block_header')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
    let tags = document.querySelectorAll('div.search_results a.htag_rel_a');
    destination = tags[tags.length-1];
    if (destination != undefined) {
        insertAfter(destination, newButton);
        return;
    }
    destination = document.getElementsByClassName('blog_sort_div')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
}

function addLoadExternalButton() {
    let newButton = document.createElement("button");
    newButton.setAttribute("style", "margin-left:10px; opacity:0.3;border: none; padding: 1px 3px; ");
    newButton.id="load_external_sizes";
    newButton.innerText="load external sizes";
    newButton.addEventListener("click", function() {
        let allBoxes = document.querySelectorAll('div.post_text');
        allBoxes.forEach(box => {
            let externalLinksForThisBox = box.querySelectorAll('a.extlink');
            if (externalLinksForThisBox.length > 0) {
                loadSizesForAllExternalLinks(box, externalLinksForThisBox);
            }
        });
    });
    let destination = document.getElementsByClassName('splitter_block_header')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
    let tags = document.querySelectorAll('div.search_results a.htag_rel_a');
    destination = tags[tags.length-1];
    if (destination != undefined) {
        insertAfter(destination, newButton);
        return;
    }
    destination = document.getElementsByClassName('blog_sort_div')[0];
    if (destination != undefined) {
        insertAsLastChild(destination, newButton);
        return;
    }
}
function loadWhiteSizes() {
    let whiteButtons = document.querySelectorAll('.get_movie_size:not(.red)');
    whiteButtons.forEach(b => b.click());
}

function hideRed() {
    let redLabels = document.querySelectorAll('.red');
    redLabels.forEach(label => {label.parentElement.parentElement.style.opacity = '0.3'; } );
}

function resetRed() {
    let redLabels = document.querySelectorAll('.red');
    redLabels.forEach(label => {label.parentElement.parentElement.style.opacity = '1'; label.classList.remove('red'); } );
}

function resetGreen() {
    let redLabels = document.querySelectorAll('.green');
    redLabels.forEach(label => label.classList.remove('green') );
}


function draw() {
    // remove old lines:
    let drawnLines = document.querySelectorAll('.drawnLine');
    for (let drawnLine of drawnLines) {
        drawnLine.remove();
    }

    map.forEach((sizes, duration) => {
        if (sizes.length == 1) {
            return;
        }
        let maxSize = getMaxNumber(sizes);
        let els = mapEl.get(duration);
        let lineClass = 'line'+duration.replaceAll(':','-');
        for (let i = 0 ; i < sizes.length ; i++) {
            if (sizes[i] == maxSize) {
                for (let j = 0 ; j < sizes.length ; j++) {
                    if (i == j) {
                        continue;
                    }

                    let bothSizesAreMaxSize = false;
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
    let rect1 = el1.getBoundingClientRect();
    let rect2 = el2.getBoundingClientRect();
    let x1 = rect1.x+pageXOffset;
    let y1 = rect1.y+window.pageYOffset;
    let x2 = rect2.x+pageXOffset;
    let y2 = rect2.y+window.pageYOffset;
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    linedraw(x1, y1, x2, y2, lineClass, noGradient);
    attachShowHideListeners(el1, el2, lineClass);
}

function attachShowHideListeners(el1, el2, lineClass) {
    el1.addEventListener('mouseover', function handleMouseOver() {
        let lines = document.querySelectorAll('.' + lineClass);
        lines.forEach(line => {line.style.display = 'block'});
    });

    el1.addEventListener('mouseout', function handleMouseOut() {
        let lines = document.querySelectorAll('.' + lineClass);
        setTimeout(function() {lines.forEach(line => {line.style.display = 'none'});}, 1500);
    });

    el2.addEventListener('mouseover', function handleMouseOver() {
        let lines = document.querySelectorAll('.' + lineClass);
        lines.forEach(line => {line.style.display = 'block'});
    });

    el2.addEventListener('mouseout', function handleMouseOut() {
        let lines = document.querySelectorAll('.' + lineClass);
        setTimeout(function() {lines.forEach(line => {line.style.display = 'none'});}, 1500);
    });
}

function linedraw(x1, y1, x2, y2, lineClass, noGradient) {
    let switchGradientDirection = false;
    if (x2 < x1) {
        let tmp;
        tmp = x2 ; x2 = x1 ; x1 = tmp;
        tmp = y2 ; y2 = y1 ; y1 = tmp;
        switchGradientDirection = true;
    }
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    // console.log(`drawing from ${x1} ${x1} to ${x2} ${y2}`);
    let lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    let m = (y2 - y1) / (x2 - x1);
    let degree = Math.atan(m) * 180 / Math.PI;

    let destination = document.querySelector('#linesContainer');
    // console.log("creating line"+x1+y1+x2+y2);
    let backgroundCSS;
    if (noGradient == true) {
        backgroundCSS = 'background: yellow;';
    } else {
        if (switchGradientDirection) {
            backgroundCSS = 'background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,255,0,1) 100%);';
        } else {
            backgroundCSS = 'background: linear-gradient(90deg, rgba(255,255,0,1) 0%, rgba(255,0,0,1) 100%);';
        }
    }
    destination.innerHTML += "<div class='"+lineClass+" drawnLine' style='display: none; position: absolute; z-index:10; transform-origin: top left; transform: rotate(" + degree + "deg); width: " + lineLength + "px; height: 3px; " + backgroundCSS + " top: " + y1 + "px; left: " + x1 + "px;'></div>";

}

function checkDurations() {
    let hasResults = document.querySelector('.page_message');
    if (hasResults != undefined && hasResults.innerText.indexOf('Nothing Found')>-1) {
        return;
    }

    let boxes = document.querySelectorAll('div.post_el_small');
    if (boxes.length == 0) {
        return ;
    }
    for (let i = 0 ; i<boxes.length ; i++) {
        let found = false;
        let el = boxes[i];
        let durationBox = el.querySelector('.duration_small');
        if (durationBox == null) {
            continue;
        }
        let duration = durationBox.innerText;
        for (let j = i+1 ; j<boxes.length ; j++) {
            if (i == j) {
                continue;
            }
            let el2 = boxes[j];
            let durationBox2 = el2.querySelector('.duration_small');
            if (durationBox2 == null) {
                continue;
            }
            let duration2 = durationBox2.innerText;
            //console.log('checking ' + duration + ' == ' + duration2);
            if (duration == duration2) {
                if (el2.querySelector('.movieSize') != undefined) {
                    let button2 = el2.querySelector('.get_movie_size');
                    if (button2 != undefined) {
                        found = true;
                        button2.click();
                    }
                }
            }
        }
        if (found) {
            if (el2.querySelector('.movieSize') != undefined) {
                let button = el.querySelector('.get_movie_size');
                if (button != undefined) {
                    button.click();
                }
            }
        }
    }
}

function addSizesWhenBrowsing() {
    let boxes = document.querySelectorAll('div.post_el_small');
    if (boxes.length == 0) {
        return ;
    }
    let selStartTime, selEndTime;
    //selStartTime = performance.now();
    boxes.forEach(box => {
        if (!box.classList.contains('alreadyProcessed')) {
            box.classList.add('alreadyProcessed');
            addButtonToGetMovieSize(box);
        }
    });
    //selEndTime = performance.now();
}


function addButtonToGetMovieSize(box) {
    let referenceNode = box.getElementsByClassName('post_time')[0];
    if (referenceNode == undefined) {
        return;
    }
    let getMovieSizeButtonAlreadyExists = box.getElementsByClassName('get_movie_size');
    if (getMovieSizeButtonAlreadyExists.length > 0) {
        //skip adding another button when "load next" is clicked too fast
        return;
    }
    let newButton = document.createElement("button");
    newButton.setAttribute("style", "margin-left:10px; opacity:0.1;border: none; padding: 1px 3px; ");
    newButton.setAttribute("class", "get_movie_size");
    newButton.innerText="get";
    newButton.addEventListener("mouseover", function() { go(box) });
    newButton.addEventListener("click", function() { go(box) });
    insertAfter(referenceNode, newButton);
}

function go(box) {
    let movieLink = box.querySelector('a.js-pop');
    if (movieLink == undefined) {
        movieLink = box.querySelector('.post_control>a');
    }
    let movieHref = movieLink.href;
    downloadGetMovieSizeAndAddNewElement(movieHref, box);
}

function setMovieSize(movieSize, el) {
    let movieSizeElement = createTextElement(movieSize + ' MB');
    let destination = el.getElementsByClassName('post_time')[0];
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
            let $page = $(data);
            let movieSize = $page.find('div.post_control').first().prev().text();
            const regex = /size:(\d+)/i;
            let match = regex.exec(movieSize);
            if (match == undefined) {
                setMovieSize('---', el);
            } else {
                setMovieSize(match[1], el);
                addResultToMap(el, match[1]);
                // only for box view
                updateStreamhubToHrefForBoxView(el, match[1]);
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

/**
  For box view:
  If this box contains streamhub.to link its href will be suffixed with original http movie size
*/
function updateStreamhubToHrefForBoxView(box, movieSize) {
    let externalLinksForThisBox = box.querySelectorAll('a.extlink');
    if (externalLinksForThisBox.length > 0) {
        externalLinksForThisBox.forEach((link, index) => {
            if (contains(link.href, 'streamhub.to') || contains(link.href, 'streamvid.net') || contains(link.href, 'sbembed.com') || contains(link.href, 'vtube.to') || contains(link.href, 'wolfstream.tv') || contains(link.href, 'filelions.to') || contains(link.href, 'filemoon.sx') || contains(link.href, 'embedrise.com') || contains(link.href, 'vtbe.to')) {
                // just including filesize in the link
                let normalSize = box.querySelector('.movieSize').innerText.replace(' ','');
                link.href = link.href + '#' + normalSize;
                return;
            }
        });
    }
}
/**
  For single movie page view:
  If this box contains streamhub.to link its href will be suffixed with original http movie size
*/
function updateStreamhubToHrefForSingleMoviePage(box) {
    let externalLinksForThisBox = box.querySelectorAll('a.extlink');
    if (externalLinksForThisBox.length > 0) {
        externalLinksForThisBox.forEach((link, index) => {
            if (contains(link.href, 'streamhub.to') || contains(link.href, 'streamvid.net') || contains(link.href, 'sbembed.com') || contains(link.href, 'vtube.to') || contains(link.href, 'wolfstream.tv') || contains(link.href, 'filelions.to') || contains(link.href, 'filemoon.sx') || contains(link.href, 'embedrise.com')|| contains(link.href, 'vtbe.to')) {
                // just including filesize in the link
                let normalSize = $('div.post_control').first().prev().text();
                const regex = /size:(\d+)/i;
                let match = regex.exec(normalSize);
                if (match == undefined) {
                    normalSize = '---';
                } else {
                    normalSize = match[1];
                }
                link.href = link.href + '#' + normalSize;
                return;
            }
        });
    }
}


function makeTimeElementCopyLinkToClipboard() {
    let times = document.querySelectorAll('.duration_small');
    times.forEach((span) => span.addEventListener('click', function (event) {
        event.preventDefault();
        let url = event.currentTarget.closest('a.js-pop');
        setTimeout( function() { copyTextToClipboard(url); } , 100);
    }));
}

function addResultToMap(el, size) {
    let timeElement = el.getElementsByClassName('duration_small');
    if (timeElement === undefined || timeElement[0] === undefined) {
        return;
    }
    let duration = timeElement[0].innerText;
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

        if (duration == "EXTERNAL LINK") {
            let els = mapEl.get(duration);
            for (let i = 0 ; i < sizes.length ; i++) {
                els[i].querySelector('.movieSize').classList.add('grey');
            }
            return;
        }
        if (sizes.length == 1) {
            return;
        }
        let maxSize = getMaxNumber(sizes);
        let els = mapEl.get(duration);

        for (let i = 0 ; i < sizes.length ; i++) {
            if (maxSize == sizes[i]) {
                els[i].querySelector('.movieSize').classList.add('green');
            } else {
                els[i].querySelector('.movieSize').classList.add('red');
            }
        }
    });
}

function getMaxNumber(sizes) {
    let maxNum = 0;
    for (let i = 0 ; i < sizes.length ; i++) {
        if (sizes[i] > maxNum) {
            maxNum = sizes[i];
        }
    }
    return maxNum;
}

function getIndexOfMaxNumber(sizes) {
    let maxNum = 0;
    let maxIndex = 0;
    for (let i = 0 ; i < sizes.length ; i++) {
        if (sizes[i] > maxNum) {
            maxNum = sizes[i];
            maxIndex = i;
        }
    }
    return maxIndex;
}

function removeButton(el) {
    let button = el.getElementsByClassName('get_movie_size');
    if (button[0]!=undefined) {
        button[0].remove();
    }
}

function createTextElement(text) {
    let newElement = document.createElement("span");
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
    let match = regex.exec(text);
    if (match == null) {
        return undefined;
    }
    let result = match[1];
    return result;
}

function contains(haystack, needle) {
    return haystack.indexOf(needle) > -1;
}

// copying requires hidden textarea
function copyTextToClipboard(text) {
    let textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
        let successful = document.execCommand('copy');
        let msg = successful ? 'successful' : 'unsuccessful';
        //console.log('Copying text command was ' + msg);
    } catch (err) {
        //console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}
