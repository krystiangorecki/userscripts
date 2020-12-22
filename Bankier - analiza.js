// ==UserScript==
// @name         Bankier - analiza
// @namespace    https://github.com/krystiangorecki/userscripts/
// @version      0.1
// @match        https://www.bankier.pl/inwestowanie/profile/quote.html?symbol=*
// @grant        none
// ==/UserScript==

/*
TODO lepsze ustalanie daty początkowej wykresu
*/

(function() {
    'use strict';
    setTimeout(addManualStartButton, 100);
    //  setTimeout(execute, 500);
})();


var allMessages = [];

function execute() {
    var periodButton = document.querySelector("#wykresButton button.active");
    if (periodButton!=undefined) {
        var periodString = periodButton.innerText;
        resolveStartDate(periodString);
    } else {
        alert("nie zaznaczono okresu");
    }
}

function resolveStartDate(periodString) {
    var myMap = new Map();
    myMap.set("1D", 86400000 );
    myMap.set("1T", 604800000 );
    myMap.set("1M", 2629800000 );
    myMap.set("3M", 7889400000 );
    myMap.set("6M", 15552000000 );
    myMap.set("1R", 31104000000 );
    myMap.set("5L", 155520000000 );

    var msPeriod = myMap.get(periodString);
    if(msPeriod==undefined)
    {
        alert("w mapie brak okresu " + periodString);
    } else{
        removeExistingMessageLinks();
        var now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        var tsNow = new Date(now).getTime();
        var messages = loadMessagesAfter(new Date(tsNow - msPeriod));
    }
}

function removeExistingMessageLinks() {
    var links = document.querySelectorAll('.newLink');
    if (links != undefined){
        for (const link of links) {
            link.remove();
        }
    }
}

function loadMessagesAfter(graphBeginDate) {
    console.log("graphBeginDate " + graphBeginDate);
    var moreLink = document.querySelector('.box300 .more-link');
    var baseUrl = moreLink.href;
    var currentPageNumber = 1;
    loadNextPage(baseUrl, currentPageNumber, graphBeginDate);
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

function addManualStartButton(){
    var newLink = document.createElement("button");
    newLink.innerText = 'START';
    insertAfter(document.querySelector('#wykresButton'), newLink);
    newLink.addEventListener("click", execute);
}

function loadNextPage(url, currentPageNumber, graphBeginDate) {
    $.ajax ( {
        type:       'GET',
        url:         url + "\\" + currentPageNumber,
        dataType:   'html',
        success:    function (data) {
            var $page = $(data);
            var $elements = $page.find('div.article');
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
            //debugger;
            var lastMessageDate = new Date(Date.parse(lastMessage.date));
            // alert("lastMessageDate: " + lastMessageDate + "    graphBeginDate: " + graphBeginDate);
            var isLastPage = $(this).find("#articleList a.numeral").last().hasClass("active");
            var lastMessageDateOlderThanGraphBeginDate = lastMessageDate.getTime() < graphBeginDate.getTime();
            if (!isLastPage && !lastMessageDateOlderThanGraphBeginDate) {
                // alert("pobieram stronę " + (currentPageNumber+1));
                loadNextPage(url, ++currentPageNumber, graphBeginDate);
            } else {
                renderAllMessages(allMessages, graphBeginDate);
            }
        }
    } );
}


function renderAllMessages(allMessages, graphBeginDate) {
    var wykresBox = document.querySelector('#wykres').getBoundingClientRect();
    var wykresWidth = document.querySelector('#wykres').offsetWidth-65;
    var tsGraphBegin = graphBeginDate.getTime();

    var now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    var tsNow = new Date(now).getTime();

    var graphDurationInMs = tsNow - tsGraphBegin;
    console.log("tsGraphBegin " + tsGraphBegin);
    console.log("tsNow " + tsNow);
    allMessages.forEach((message) => {
        var tsMessageTime = new Date(Date.parse(message.date)).getTime();
        if(tsMessageTime > tsGraphBegin){
            //debugger;
            var timeInMsFromGraphBegin = tsMessageTime - tsGraphBegin;
            var messagePlacementFraction = timeInMsFromGraphBegin/graphDurationInMs;
            var position = wykresWidth*messagePlacementFraction;
            var newLink = document.createElement("a");
            newLink.classList.add("newLink");
            newLink.innerHTML = '<b style="font-size: large;">↓</b>';
            newLink.title = message.date + " " + message.title;
            newLink.style="position:absolute; top:0px; left:" + (7+position) + "px; z-index=999;";
            insertAfter(document.querySelector('#wykres'), newLink);
        } else{
            //  alert("wiadomość z dnia " + Date.parse(message.date) + " jest za stara do pokazania na wykresie bo wykres zaczyna się od " + graphBeginDate);
        }
    });

}
