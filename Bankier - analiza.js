// ==UserScript==
// @name         Bankier - analiza
// @namespace    https://github.com/krystiangorecki/userscripts/
// @version      1.3
// @description  "Knowledge is of no value unless you put it into practice."
// @match        https://www.bankier.pl/inwestowanie/profile/quote.html?symbol=*
// @updateURL    https://raw.githubusercontent.com/krystiangorecki/userscripts/master/Bankier%20-%20analiza.js
// @downloadURL  https://raw.githubusercontent.com/krystiangorecki/userscripts/master/Bankier%20-%20analiza.js
// @grant        none
// ==/UserScript==

// https://github.com/krystiangorecki/userscripts/edit/master/Bankier%20-%20analiza.js
(function() {
    'use strict';
    setTimeout(addManualStartButton, 100);
})();

var allMessages;

function execute() {
    allMessages = [];
    var periodButton = document.querySelector("#wykresButton button.active");
    if (periodButton != undefined) {
        var periodString = periodButton.innerText;
        var graphBeginDate = resolveStartDate(periodString);
        var symbolToRender = '↓';
        var messages = loadMessagesAfter(graphBeginDate, symbolToRender);
        symbolToRender = '📎';
        var statements = loadStatementsAfter(graphBeginDate, symbolToRender);

    } else {
        alert("nie zaznaczono okresu");
    }
}

function resolveStartDate(periodString) {
    removeExistingMessageLinks();

    var graphBeginDate = new Date();
    graphBeginDate.setHours(9);
    graphBeginDate.setMinutes(0);
    graphBeginDate.setSeconds(0);

    switch(periodString) {
        case "1D":
            graphBeginDate.setHours(graphBeginDate.getHours()-24);
            break;
        case "1T":
            graphBeginDate.setHours(graphBeginDate.getHours()-(7*24));
            break;
        case "1M":
            graphBeginDate.setMonth(graphBeginDate.getMonth()-1);
            break;
        case "3M":
            graphBeginDate.setMonth(graphBeginDate.getMonth()-3);
            break;
        case "6M":
            graphBeginDate.setMonth(graphBeginDate.getMonth()-6);
            break;
        case "1R":
            graphBeginDate.setMonth(graphBeginDate.getMonth()-12);
            break;
        case "5L":
            graphBeginDate.setMonth(graphBeginDate.getMonth()-60);
            break;
        case "Max":
            var graphBeginDateInput = document.querySelector('input#periodStart');
            if (graphBeginDateInput != undefined) {
                var tsGraphBeginDateString = graphBeginDateInput.dataset.min_date;
                var tsGraphBeginDate = parseInt(tsGraphBeginDateString, 10);
                graphBeginDate = new Date(tsGraphBeginDate);
            }
            break;
        default:
            alert("w switchu brak pozycji: " + periodString);
            return undefined;
    }
    return graphBeginDate;
}

function removeExistingMessageLinks() {
    var links = document.querySelectorAll('.newLink');
    if (links != undefined){
        for (const link of links) {
            link.remove();
        }
    }
}

function loadMessagesAfter(graphBeginDate, symbolToRender) {
    var moreLink = document.querySelector('.box300 .more-link');
    var baseUrl = moreLink.href;
    var currentPageNumber = 1;
    loadNextPage(baseUrl, currentPageNumber, graphBeginDate, symbolToRender);
}

function loadStatementsAfter(graphBeginDate, symbolToRender) {
    var moreLink = document.querySelectorAll('.box300 .more-link')[1];
    var baseUrl = moreLink.href;
    var currentPageNumber = 1;
    loadNextPage(baseUrl, currentPageNumber, graphBeginDate, symbolToRender);
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

function addManualStartButton() {
    if (isMessagesLinkPresent()) {
        var newLink = document.createElement("a");
        newLink.innerText = 'START';
        newLink.id = 'startButton';
        newLink.classList.add('btnOrange');
        insertAfter(document.querySelector('#wykresButton'), newLink);
        newLink.addEventListener("click", execute);
    }
}

function isMessagesLinkPresent() {
   return document.querySelector('.box300 .more-link') != null;
}

function loadNextPage(url, currentPageNumber, graphBeginDate, symbolToRender) {
    $.ajax ( {
        type:       'GET',
        url:         url + "\\" + currentPageNumber,
        dataType:   'html',
        success:    function (data) {
            var $page = $(data);
            var $elements = $page.find('section.section div.article');
            var pageMessages = [];
            $elements.each(function( index ) {
                var newMessage = [];
                newMessage.title = $(this).find(".entry-title a").text().trim();
                newMessage.date = $(this).find(".entry-meta>time").text().trim().split(" ")[0];
                newMessage.href = $(this).find(".entry-title a").attr("href");
                pageMessages.push(newMessage);
            });
            allMessages = allMessages.concat(pageMessages);
            var lastMessage = pageMessages[pageMessages.length-1];
            var isLastPage = false;
            if(lastMessage != undefined) {
                var lastMessageDate = new Date(Date.parse(lastMessage.date));
                isLastPage = $page.find("#articleList a.numeral").last().hasClass("active");
                var lastMessageDateOlderThanGraphBeginDate = lastMessageDate.getTime() < graphBeginDate.getTime();
            } else {
                isLastPage = true;
            }
            if (!isLastPage && !lastMessageDateOlderThanGraphBeginDate) {
                loadNextPage(url, ++currentPageNumber, graphBeginDate, symbolToRender);
            } else {
                renderAllMessages(allMessages, graphBeginDate, symbolToRender);
            }
        }
    } );
}


function renderAllMessages(allMessages, graphBeginDate, symbolToRender) {
    var wykresBox = document.querySelector('#wykres').getBoundingClientRect();
    var wykresWidth = document.querySelector('#wykres').offsetWidth-65;
    var tsGraphBegin = graphBeginDate.getTime();

    var now = new Date();
    if (now.getHours() > 17) {
        now.setHours(17);
    }
    now.setMinutes(0);
    now.setSeconds(0);
    var tsNow = new Date(now).getTime();

    var graphDurationInMs = tsNow - tsGraphBegin;
    var allowOneOverTheRange = true;
    allMessages.forEach((message, i) => {
        var tsMessageTime = new Date(Date.parse(message.date)).getTime();
        if(tsMessageTime > tsGraphBegin || allowOneOverTheRange){
            if(tsMessageTime <= tsGraphBegin){
                allowOneOverTheRange = false;
            }
            var timeInMsFromGraphBegin = tsMessageTime - tsGraphBegin;
            var messagePlacementFraction = timeInMsFromGraphBegin/graphDurationInMs;
            var position = wykresWidth*messagePlacementFraction;
            var newLink = document.createElement("a");
            newLink.classList.add("newLink");
            var fontWeigh = symbolToRender == '↓' ? 200 : 'large';
            newLink.innerHTML = '<b style="font-weigh: '+fontWeigh+';">' + symbolToRender + '</b>';
            newLink.title = message.date + " " + message.title;
            newLink.style="position:absolute; left:" + (7+position) + "px; z-index:1;  opacity:0.0; top:-20px; transition: all 1s;";
            newLink.href = message.href;
            insertAfter(document.querySelector('#wykres'), newLink);
            var topValue = symbolToRender == '↓' ? 10 : 30;
            setTimeout(function() {
                $(newLink).css({ opacity: "1", top: topValue+"px"});
            }, 10*i);
        } else{
            //  alert("wiadomość z dnia " + Date.parse(message.date) + " jest za stara do pokazania na wykresie bo wykres zaczyna się od " + graphBeginDate);
        }
    });

}
