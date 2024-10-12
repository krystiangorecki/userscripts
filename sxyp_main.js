// ==UserScript==
// @name         sxyp
// @namespace    https://github.com/krystiangorecki/userscripts/
// @author       You
// @description  "Do the difficult things while they are easy and do the great things while they are small."
// @match        https://yp
// @match        https://yp/o/*
// @match        https://yp/*.html*
// @match        https://sxyp/
// @match        https://sxyp/o/*
// @match        https://sxyp/*.html*
// @match        https://sxyp/
// @version      1.74
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

//v1.1 added marking external links
//v1.2 added direct links on movie page with separate scenes
//v1.3 remove " and " from search query
//v1.4 remove some unused code
//v1.5 added hexupload
//v1.5 added external icons + small fixes
//v1.7 moved progress numbers to another script
//v1.71 minor url replacement fixes
//v1.72 mat6 search
//v1.73 fixed -amp- replacement
//v1.74 cursor: grabbing

var buttonStyle = ''; //"right:0px; position:relative";

GM_addStyle(' .sharing_toolbox {    margin-top: 5px;    text-align: right;    position: absolute;  z-index:100;   right: 40px; } ');
// remove plus icon by the names to submit another name (available only for logged in users)
GM_addStyle(' .sub_add_nl {    display:none; } ');
GM_addStyle(' span.sub_add {    display:none; } ');
GM_addStyle(' .pes_author_div {   user-select: none; } ');



(function() {
    'use strict';
    redirectIfSearchQueryContainsAnd();
    removeUnnecessaryElements();
    copyMovieSizeToTheTop();
    markLesAndSolo();
    markExternalLinks();
    addLinksToPlaylist();
    //  player();
    addComboButton();
    addCopyLinkButton();
    addCopyButton();
    addDownloadButton();
    addMat6SearchLink();
    removeLayerOverThePlayer();
    redirectToDVMirrorSite();
    showLinkForEachSceneInCaseOfComboContainer();
    /*
    $("[onclick]").removeAttr("onclick");
    $("*").unbind("click");
    $("[onclick]").removeAttr("onclick");
    $("*").unbind("click");
*/
    removeAllIframes();
})();

function removeUnnecessaryElements() {
    //remove Watch Later icons (available only for logged in users)
    var clockIcons = document.querySelectorAll(".pes_wl");
    for (let i = 0; i < clockIcons.length; ++i) {
        clockIcons[i].remove();
    }
    // remove donate $$$ icon
    var donateIcons = document.querySelectorAll(".donate");
    for (let i = 0; i < donateIcons.length; ++i) {
        donateIcons[i].remove();
    }
    // remove uploader name initial icon
    var initialIcons = document.querySelectorAll(".a_char");
    for (let i = 0; i < initialIcons.length; ++i) {
        initialIcons[i].remove();
    }
    // pluses by the names
    setTimeout(function() {
        var pluses = document.querySelectorAll("span.sub_add");
        for (let i = 0; i < pluses.length; ++i) {
            pluses[i].remove();
        }
    }, 200);
    // pluses by the names
    setTimeout(function() {
        var pluses = document.querySelectorAll(".sub_add_nl");
        for (let i = 0; i < pluses.length; ++i) {
            pluses[i].remove();
        }
    }, 200);
}

function redirectIfSearchQueryContainsAnd() {
    var url = window.location.href;
    if (url.includes('-and-') || url.includes('-And-') || url.includes('%20And%20') || url.includes('-amp-') || url.includes('%E2%80%93') || url.includes('--') ) {
        var newurl = url.replace('-and-', '-').replace('-And-', '-').replace('%20And%20', '-').replace('-amp-', '-').replace('%E2%80%93', '-').replace('--', '-');
        window.location = newurl;
    }
}

function showLinkForEachSceneInCaseOfComboContainer() {
    var scenes = document.querySelectorAll('div.combo_container .combo_mode');
    if (scenes.length > 0) {
        for (var i = 0 ; i < scenes.length ; i++) {
            var sceneId = scenes[i].dataset.postid;
            var href = "/post/" + sceneId + ".html";
            addButtonAfter("DIRECT LINK", href, "", "", scenes[i]);
        }
    }
}

function copyMovieSizeToTheTop() {
    setTimeout(function() {
        var dest = document.querySelector('b.donate');
        if (dest == undefined) {
            return;
        }
        var text = document.querySelector('div.post_control').previousSibling.innerText;
        const regex = /size:(\d+)/i;
        var match = regex.exec(text);
        if (match != undefined) {
            var newElement = document.createElement('span');
            newElement.innerText = match[1] + ' MB';
            newElement.classList.add('post_text');
            newElement.setAttribute('style','padding-left:50px');
            insertAfter(dest, newElement);
        }
    }, 10);

}

function removeLayerOverThePlayer() {
    setTimeout(function() {
        var adLinkOverThPlayer = document.querySelector('#vid_container_id>a.tdn');
        if (adLinkOverThPlayer != null) {
            adLinkOverThPlayer.outerHTML='';
        }
    }, 1000);

}

function redirectToDVMirrorSite() {

    var url = window.location.pathname;
    var match = url.match(/([a-fA-F\d]{10,15}).html/);
    if (match == undefined) {
        return;
    }
    var movieId = match[1];
    var buttonId = "gotoMirror";
    var href = "http://" + decodeURIComponent('%64%65%75%74%73%63%68%6'+'5%2e%76%69%64%65%6f') + "/Main/" + movieId

    // if Post Not Found
    var insertAfterElement = document.querySelector('.page_message');
    if (insertAfterElement != null) {
        addButtonAfter('[ GO TO MIRROR ]', href, buttonId, '', insertAfterElement);
        return;
    }

    insertAfterElement = document.querySelector('.post_text');
    if (insertAfterElement != null) {
        addButtonAfter('[ GO TO MIRROR ]', href, buttonId, '', insertAfterElement);
        return;
    }

    //if content removed
    insertAfterElement = document.querySelector('span[style="position: relative;top:20%;font-size: 25px;font-weight: bold;"]');
    if (insertAfterElement == null) {
        return;
    }
    addButtonAfter('[ GO TO MIRROR ]', href, buttonId, '', insertAfterElement);

}

function delayedLayerRemoval() {
    setTimeout(function() {
        var divs = document.querySelectorAll("div[id][style]");
        if (divs.length>0) {
            divs[divs.length].outerHTML='';
        }
    }, 3000);
}

function player() {

    function hvponplay(el) {
        $(el).fadeIn();
    }
    $(document).on('mouseover','.maxi_post_player_img, .mini_post_player_img', function(e) {
        var thumb_el = $(this).closest('div.vid_container').find('img');
        var hvp = thumb_el.data('hvp');
        var isrc = thumb_el.data('hvpsrc');
        var hvpp = thumb_el.attr('data-hvpp');
        if (hvp == "0" || isrc == '/css/converting.jpg') return;
        if (hvpp == "0") {
            hvp_src = isrc.replace("full.jpg", "vidthumb.mp4");
            var hvp_player = "<video autoplay loop class='hvp_player' onplay='hvponplay(this)' src='"+hvp_src+"'></video>";
            $(this).closest('div.vid_container').prepend(hvp_player);
            thumb_el.attr('data-hvpp',"1");
        } else {
            $(this).closest('div.vid_container').find('video.hvp_player').fadeIn();
        }
    });

    // player stop delayed by 30s
    $(document).on('mouseout','.maxi_post_player_img, .mini_post_player_img', function(e) {
        var customThis = $(this);
        setTimeout(function() {
            var thumb_el = customThis.closest('div.vid_container').find('img');
            var hvpp = thumb_el.attr('data-hvpp');
            if (hvpp == "0") return;
            customThis.closest('div.vid_container').find('video.hvp_player').fadeOut();
        }, 30000, customThis);
    });
}


function addLinksToPlaylist() {
    var linkTemplate = document.querySelectorAll(".pl_vid_el");
    for (var i=0; i<linkTemplate.length; i++){
        var hash = linkTemplate[i].dataset.hash;
        linkTemplate[i].outerHTML = '<a href="/post/' + hash + '.html">' + linkTemplate[i].outerHTML + '</a>';
    }
}

function addCopyButton() {
    var insertAfterElement = document.querySelector('.ypsv-nm-div');
    if (insertAfterElement == null) {
        return;
    }
    var title = cleanTitle();
    var buttonId = "copyButton";
    addButtonAfter('[ copy ]', '#', buttonId, '', insertAfterElement);
    var valueToCopy = title;
    makeButtonCopyToClipboard(buttonId, valueToCopy);
}


function cleanTitle() {
    var titleBlock = document.querySelector('div.post_text');
    // usuwam tagi (sposób 1) wszystkie linki z klasą hash_link
    var tagsToRemove = titleBlock.querySelectorAll("a.hash_link");
    if (tagsToRemove.length > 0) {
        for (var i = 0; i < tagsToRemove.length ; i++){
            if (tagsToRemove[i].innerText.indexOf("#") == 0) {
                tagsToRemove[i].outerHTML="";
            }
        }
    }

    // usuwam tagi (sposób 2) wszystko po ostatnim plusie
    var title = titleBlock.innerText;
    /*if (title.indexOf("+") != -1) {
        title = title.substring(0, title.lastIndexOf("+"));
    }*/
    /*var names = document.querySelectorAll('.video-tags-list .btn.btn-default.label:not(.main)');
    if (names.length > 0) {
        for (var i = 0; i < names.length ; i++){
            if (names[i].innerText.indexOf("+") == -1) {
                title += ', ' + names[i].innerText;
            }
        }
    }*/
    title += ' ';
    title = title.replace(/\(Download ASAP. I WILL NOT be Re-uploading it\)/g , " ");
    title = title.replace(/\t+/g , " ");
    title = title.replace(/ ✓/g , " ");
    title = title.replace(/\?/g , " ");
    title = title.replace(/\\/g , " ");
    title = title.replace(/\//g , " ");
    title = title.replace(/\+/g , " ");
    title = title.replace(/\n/g , " ");
    title = title.replace(/\|/g , " ");
    title = title.replace(/\*/g , " ");
    title = title.replace(/"/g , " ");
    title = title.replace(/Cast:/g , " ");
    title = title.replace(/:/g , " ");
    title = title.replace(/#HD/g , " ");
    title = title.replace(/#/g , "");
    title = title.replace(/⭐/g , "");
    title = title.replace(/, ,/g , "");
    title = title.replace(/  /g , " ");

    return title;
}

function addMat6SearchLink() {
    var destination = document.querySelector('.search_bar');
    if (destination == null) {
        return;
    }
    var newLink = document.createElement("a");
    newLink.text = "[mat6]";
    newLink.setAttribute("id", "mat6search");
    newLink.setAttribute("style", "color:#FFFFFF;position:absolute;right: 70px; cursor: pointer;");
    newLink.onclick = searchMat6;
    insertAsFirstChild(destination, newLink);
}

function searchMat6() {
    var searchTerm = document.querySelector('#se_in').value;
    window.open('https://mat6tube.tv/video/' + searchTerm);
}

function addCopyLinkButton() {
    var insertAfterElement = document.querySelector('.ypsv-nm-div');
    if (insertAfterElement == null) {
        return;
    }
    var buttonId = "copyLinkButton";
    addButtonAfter('[ copylink ]', '#', buttonId, '', insertAfterElement);
    var video = document.querySelector("video");
    var valueToCopy = video.src;
    makeButtonCopyToClipboard(buttonId, valueToCopy);
}

function removeAllIframes() {
    var iframes = document.querySelectorAll("iframe");
    for (var i = 0; i < iframes.length; ++i) {
        iframes[i].remove();
    }
    var ads = document.querySelectorAll(".fbd");
    for (i = 0; i < ads.length; ++i) {
        ads[i].remove();
    }
    var toolbox = document.querySelector("#sharing_toolbox");
    if (toolbox != null) {
        toolbox.remove();
    }

}

function addDownloadButton() {
    var insertAfterElement = document.querySelector('.ypsv-nm-div');
    if (insertAfterElement == undefined) {
        return;
    }
    var video = document.querySelector("video");
    addButtonAfter("[ download ]", video.src, "", "", insertAfterElement);

    setTimeout(function() {
        var insertAfterElement = document.querySelector("#copyButton");
        if (insertAfterElement == undefined) {
            return;
        }
        var video = document.querySelector("video");
        var buttonId = "saveAsButton";
        addButtonAfter('[ SAVE AS ... ]', video.src, buttonId, '', insertAfterElement);
    },3000);

}

function addButtonAfter(label, href, buttonId, buttonClass, insertAfterElement) {
    var newbutton = document.createElement("a");
    newbutton.text = label;
    if (href != undefined && href.length>0 ) {
        newbutton.setAttribute("href", href);
    }
    if (buttonId != undefined && buttonId.length>0) {
        newbutton.setAttribute("id", buttonId);
    }
    if (buttonClass != undefined && buttonClass.length>0) {
        newbutton.setAttribute("class", buttonClass);
    }
    newbutton.setAttribute("style", buttonStyle);
    insertAfterElement.parentNode.insertBefore(newbutton, insertAfterElement.nextSibling);
}

function addComboButton() {
    var insertAfterElement = document.querySelector('.ypsv-nm-div');
    if (insertAfterElement == null) {
        return;
    }
    var video = document.querySelector("video");
    var valueToCopy = video.src;
    var buttonId = "comboCopyLinkButton";
    addButtonAfter(" [ copy both ] ", '#', buttonId, "", insertAfterElement);
    makeComboButtonCopyToClipboard(buttonId, valueToCopy);
}

function makeButtonCopyToClipboard(buttonId, valueToCopy) {
    var btn = document.querySelector('#'+buttonId);
    btn.addEventListener('click', function(event) {
        copyTextToClipboard(valueToCopy);
    });
}

// unusual, copies two values one after another
function makeComboButtonCopyToClipboard(buttonId, valueToCopy) {
    var btn = document.querySelector('#'+buttonId);
    btn.addEventListener('click', function(event) {
        //wersja 2
        var video = document.querySelector("video");
        valueToCopy = video.src;
        //copyTextToClipboard(valueToCopy);
        var valueToCopy2 = cleanTitle();
        setTimeout( function() {copyTextToClipboard(valueToCopy2);} , 500);
    });
}

// copying requires hidden textarea
function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

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
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        //console.log('Copying text command was ' + msg);
    } catch (err) {
        //console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}

function markLesAndSolo() {
    var boxes = document.querySelectorAll("div.post_text");
    for (var i = 0; i < boxes.length; ++i) {
        var text = boxes[i].textContent;
        if (text.indexOf("#"+ decodeURIComponent('%4c%65%73%62%69%61%6e')) > -1 || text.indexOf("#"+ decodeURIComponent('%6c%65%73%62%69%61%6e')) > -1 || text.indexOf("#solo") > -1 || text.indexOf("#Solo") > -1) {
            boxes[i].parentNode.style="border:1px solid grey";
        }
    }
}

function markExternalLinks() {
    var boxes = document.querySelectorAll("div.post_text");
    for (var i = 0; i < boxes.length; ++i) {
        var text = boxes[i].textContent;
        var newStyle = "";

        // mark with border color
        if (contains(text, "vtube.to")) {
            newStyle ="border:2px solid gold";
        } else if (contains(text, "hexupload")) {
            newStyle ="border:2px solid #2aa86e";
        } else if (contains(text, "ddownload")) {
            newStyle ="border:2px solid #093094";
        } else if (contains(text, "rapidgator")) {
            // newStyle ="border:2px solid #bb4500"
        }
        boxes[i].parentNode.style = newStyle;
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

function contains(haystack, needle){
    return haystack.indexOf(needle) > -1;
}
