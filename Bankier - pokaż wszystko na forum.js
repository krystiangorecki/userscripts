// ==UserScript==
// @name         Bankier - pokaż wszystko na forum
// @namespace    https://github.com/krystiangorecki/userscripts/
// @version      0.1
// @match        https://www.bankier.pl/forum/temat_*.html
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.querySelector("#showAllThread").click();
})();
