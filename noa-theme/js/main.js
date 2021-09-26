var NOA = NOA || {};
NOA.Search = {

    /**
     * This function converts a search query to use an AND operator unless
     * advanced operators are detected.  This includes any of the set of reserver
     * search operator characters plus AND,OR,NOT. For example, "wii u" becomes
     * "+wii +u" but "wii OR u" will not be modified.
     * Special characters: + - && || ! ( ) { } [ ] ^ " ~ * ? : \
     * Special operators: AND, OR, NOT
     * @param keywords
     * @return the updated keywords
     */
    changeOperator: function(queryIn) {
        // Replace full-width space to half-width space
        queryIn = queryIn.replace(/\u3000/g, " ");
        // Replace full-width double-quote to half-width
        queryIn = queryIn.replace(/[\u201c\u201d]/g, "\"");
        // Replace various forms of wii u with wiiu
        queryIn = queryIn.replace(/wii\W+(?:\w+\W+){0,1}(?:u$|u\s)/gi, "wiiu ");
        // Swap out or with OR, and with AND, not with NOT
        queryIn = queryIn.replace(/\sor\s/g, " OR ");
        queryIn = queryIn.replace(/\sand\s/g, " AND ");
        queryIn = queryIn.replace(/\snot\s/g, " NOT ");
        // Trim query string
        queryIn = queryIn.replace(/^\s+|\s+$/g, "");
        // Check invalid search input (ex: +"")
        if (queryIn.match(/^\s*\+\s*""\s*$/)) {
            return "";
        }
        // Check empty query string
        if (queryIn == "") {
            return "";
        }

        var termSeparator = " ";
        var plusChar = "+";
        var escapeChar = "\\";
        var phraseChar = "\"";
        // Can espape
        var escapableChars = "+-!&|(){}[]^\"~*?:\\";
        // Should escape in query string
        var shouldEscape = "+-!&|(){}[]^\"~:\\";
        // (Forcible) No support operators
        var forceEscape = "{}[]:";
        // Boolean Operators
        var individualOperators = [ "AND", "OR", "NOT", "&&", "||"/*, "TO"*/ ];
        var work = "^(";
        for (var w = 0; w < individualOperators.length; w++) {
            if (w > 0) work += "|";
            work += (individualOperators[w]).replace(/[\\\^\$\.\*\+\|\(\)\[\]\{\}\/]/g, "\\$&");
        }
        work += ")$";
        var reIndividualOperator = new RegExp(work);
        // Boolean Operators
        var preTermOperators = "+-!";
        // Grouping
        var groupStartChar = "(";
        var groupEndChar = ")";
        // Fuzzy Searches / Proximity Searches
        var fuzzySearch = "~";
        var reFuzzyNumber = new RegExp("^[01]?\\.?[0-9]+$");
        // Boosting a Term
        var boostingTerm = "^";
        var reBoostingNumber = new RegExp("^[0-9]*\\.?[0-9]+$");
        // Phrase checker
        var rePhraseStart = new RegExp("^" + phraseChar.replace(/[\\\^\$\.\*\+\|\(\)\[\]\{\}\/]/g, "\\$&"));
        var rePhraseEnd = new RegExp(phraseChar.replace(/[\\\^\$\.\*\+\|\(\)\[\]\{\}\/]/g, "\\$&") + "$");
        var reNonEscapedPhrase = new RegExp("[^" + escapeChar.replace(/[\\\^\$\.\*\+\|\(\)\[\]\{\}\/]/g, "\\$&") + "]" + phraseChar + "$");
        var rePhraseCharReplace = new RegExp(phraseChar, "g");
        // Escaping trick
        var trickEnable = true;
        var reEndWithEscape = new RegExp((escapeChar + escapeChar).replace(/[\\\^\$\.\*\+\|\(\)\[\]\{\}\/]/g, "\\$&") + "$");

        function QueryTerm() {
            this.fuzzySearch = false;
            this.preOp = "";
            this.term = "";
            this.postOp = "";
        };

        var queryLength = queryIn.length;
        var arrayOut = new Array(0);

        var pos = 0;
        var phrase = false;
        var currentTerm = null;
        var forceMustOperator = true;
        var groupingDepth = 0;

        while (pos < queryLength) {
            var current = queryIn.charAt(pos);
            var next = (((pos + 1) >= queryLength) ? null : (queryIn.charAt(pos + 1)));
            if (phrase) {
                if (current == phraseChar) {
                    if (next == null) {
                        if (currentTerm == null) {
                            currentTerm = new QueryTerm();
                        }
                        currentTerm.term += phraseChar;
                    } else {
                        if ((next == termSeparator) || (next == fuzzySearch) || (next == boostingTerm) || (next == groupEndChar) || (next == plusChar)) {
                            if (currentTerm == null) {
                                currentTerm = new QueryTerm();
                            }
                            currentTerm.term += phraseChar;
                            phrase = false;
                        } else {
                            if (currentTerm == null) {
                                currentTerm = new QueryTerm();
                            }
                            currentTerm.term += escapeChar + phraseChar;
                        }
                    }
                } else if (current == termSeparator) {
                    if (currentTerm == null) {
                        currentTerm = new QueryTerm();
                    }
                    currentTerm.term += termSeparator;
                } else if (current == escapeChar) {
                    if (next == null) {
                        if (currentTerm == null) {
                            currentTerm = new QueryTerm();
                        }
                        currentTerm.term += escapeChar + escapeChar;
                    } else if (escapableChars.indexOf(next) < 0) {
                        if (currentTerm == null) {
                            currentTerm = new QueryTerm();
                        }
                        currentTerm.term += escapeChar + escapeChar;
                    } else {
                        if (currentTerm == null) {

                        } currentTerm = new QueryTerm();
                        if (trickEnable && (next != escapeChar) && !currentTerm.term.match(reEndWithEscape)) {
                            currentTerm.term += escapeChar + escapeChar;
                        }
                        currentTerm.term += escapeChar + next;
                        pos++;
                    }
                } else if (forceEscape.indexOf(current) >= 0) {
                    if (currentTerm == null) {
                        currentTerm = new QueryTerm();
                    }
                    if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                        currentTerm.term += escapeChar + escapeChar;
                    }
                    currentTerm.term += escapeChar + current;
                } else if (shouldEscape.indexOf(current) >= 0) {
                    if (currentTerm == null) {
                        currentTerm = new QueryTerm();
                    }
                    if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                        currentTerm.term += escapeChar + escapeChar;
                    }
                    currentTerm.term += escapeChar + current;
                } else {
                    if (currentTerm == null) {
                        currentTerm = new QueryTerm();
                    }
                    currentTerm.term += current;
                }
            } else {
                if (current == phraseChar) {
                    if (next == null) {
                        if (currentTerm == null) {
                            currentTerm = new QueryTerm();
                            currentTerm.term += escapeChar;
                        }
                        currentTerm.term += phraseChar;
                    } else {
                        if (currentTerm == null) currentTerm = new QueryTerm();
                        if (currentTerm.term == "") {
                            currentTerm.term += phraseChar;
                            phrase = true;
                        } else {
                            currentTerm.term += escapeChar + phraseChar;
                        }
                    }
                } else if ((current == termSeparator) || (current == plusChar)) {
                    if (currentTerm != null) {
                        if (currentTerm.term.match(reIndividualOperator) && (arrayOut.length > 0)) {
                            currentTerm.preOp = currentTerm.term;
                            currentTerm.term = "";
                            forceMustOperator = false;
                        } else {
                            var work = currentTerm.term.replace(rePhraseCharReplace, "");
                            if (work.match(reIndividualOperator)) {
                                if (trickEnable) {
                                    work = escapeChar + escapeChar + work;
                                }
                                work = escapeChar + work;
                                if (currentTerm.term.match(rePhraseStart)) {
                                    work = phraseChar + work;
                                }
                                if (currentTerm.term.match(rePhraseEnd)) {
                                    work = work + phraseChar;
                                }
                                currentTerm.term = work;
                            }
                        }
                        arrayOut.push(currentTerm);
                    }
                    currentTerm = null;
                } else if (current == escapeChar) {
                    if (next == null) {
                        if (currentTerm == null) currentTerm = new QueryTerm();
                        currentTerm.term += escapeChar + escapeChar;
                    } else if (escapableChars.indexOf(next) < 0) {
                        if (currentTerm == null) currentTerm = new QueryTerm();
                        currentTerm.term += escapeChar + escapeChar;
                    } else {
                        if (currentTerm == null) currentTerm = new QueryTerm();
                        if (trickEnable && (next != escapeChar) && !currentTerm.term.match(reEndWithEscape)) {
                            currentTerm.term += escapeChar + escapeChar;
                        }
                        currentTerm.term += escapeChar + next;
                        pos++;
                    }
                } else if (preTermOperators.indexOf(current) >= 0) {
                    if (currentTerm == null) {
                        currentTerm = new QueryTerm();
                        currentTerm.preOp = current;
                        // if (current != "+") forceMustOperator = false;
                        forceMustOperator = false;
                    } else {
                        if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                            currentTerm.term += escapeChar + escapeChar;
                        }
                        currentTerm.term += escapeChar + current;
                    }
                } else if (forceEscape.indexOf(current) >= 0) {
                    if (currentTerm == null) currentTerm = new QueryTerm();
                    if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                        currentTerm.term += escapeChar + escapeChar;
                    }
                    currentTerm.term += escapeChar + current;
                } else if (current == fuzzySearch) {
                    if ((next == null) || (next == termSeparator) || (next == groupEndChar)) {
                        if (currentTerm == null) {
                            currentTerm = new QueryTerm();
                            if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                                currentTerm.term += escapeChar + escapeChar;
                            }
                            currentTerm.term += escapeChar + fuzzySearch;
                        } else {
                            currentTerm.fuzzySearch = true;
                            currentTerm.postOp = fuzzySearch;
                        }
                    } else {
                        var spos = queryIn.indexOf(termSeparator, pos + 1);
                        var spos1 = queryIn.indexOf(groupEndChar, pos + 1);
                        if (spos1 >= 0) {
                            if ((spos >=0) && (spos1 < spos)) spos = spos1;
                            if (spos < 0) spos = spos1;
                        }
                        var work;
                        if (spos < 0) {
                            work = queryIn.slice(pos + 1);
                        } else {
                            work = queryIn.slice(pos + 1, spos);
                        }
                        if (work.match(reFuzzyNumber)) {
                            if (currentTerm == null) {
                                currentTerm = new QueryTerm();
                                if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                                    currentTerm.term += escapeChar + escapeChar;
                                }
                                currentTerm.term += escapeChar + fuzzySearch;
                            } else {
                                currentTerm.fuzzySearch = true;
                                currentTerm.postOp += fuzzySearch + work;
                                arrayOut.push(currentTerm);
                                currentTerm = null;
                                pos += work.length;
                            }
                        } else {
                            if (currentTerm == null) {
                                currentTerm = new QueryTerm();
                            }
                            if (currentTerm.term.match(reNonEscapedPhrase)) {
                                currentTerm.term = currentTerm.term.slice(0, -1) + escapeChar + phraseChar;
                            }
                            if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                                currentTerm.term += escapeChar + escapeChar;
                            }
                            currentTerm.term += escapeChar + fuzzySearch;
                        }
                    }
                } else if (current == boostingTerm) {
                    if ((next == null) || (next == termSeparator) || (next == groupEndChar)) {
                        if (currentTerm == null) {
                            currentTerm = new QueryTerm();
                            if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                                currentTerm.term += escapeChar + escapeChar;
                            }
                            currentTerm.term += escapeChar + boostingTerm;
                        } else {
                            currentTerm.fuzzySearch = true;
                            currentTerm.postOp += boostingTerm;
                        }
                    } else {
                        var spos = queryIn.indexOf(termSeparator, pos + 1);
                        var spos1 = queryIn.indexOf(groupEndChar, pos + 1);
                        if (spos1 >= 0) {
                            if ((spos >=0) && (spos1 < spos)) spos = spos1;
                            if (spos < 0) spos = spos1;
                        }
                        var work;
                        if (spos < 0) {
                            work = queryIn.slice(pos + 1);
                        } else {
                            work = queryIn.slice(pos + 1, spos);
                        }
                        if (work.match(reBoostingNumber)) {
                            if (currentTerm == null) {
                                currentTerm = new QueryTerm();
                                if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                                    currentTerm.term += escapeChar + escapeChar;
                                }
                                currentTerm.term += escapeChar + boostingTerm;
                            } else {
                                currentTerm.fuzzySearch = true;
                                currentTerm.postOp += boostingTerm + work;
                                arrayOut.push(currentTerm);
                                currentTerm = null;
                                pos += work.length;
                            }
                        } else {
                            if (currentTerm == null) currentTerm = new QueryTerm();
                            if (currentTerm.term.match(reNonEscapedPhrase)) {
                                currentTerm.term = currentTerm.term.slice(0, -1) + escapeChar + phraseChar;
                            }
                            if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                                currentTerm.term += escapeChar + escapeChar;
                            }
                            currentTerm.term += escapeChar + boostingTerm;
                        }
                    }
                } else if (current == groupStartChar) {
                    if (currentTerm == null) {
                        currentTerm = new QueryTerm();
                        currentTerm.preOp += groupStartChar;
                        arrayOut.push(currentTerm);
                        currentTerm = null;
                        groupingDepth++;
                    } else {
                        if (currentTerm.term == "") {
                            currentTerm.preOp += groupStartChar;
                            arrayOut.push(currentTerm);
                            currentTerm = null;
                            groupingDepth++;
                        } else {
                            if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                                currentTerm.term += escapeChar + escapeChar;
                            }
                            currentTerm.term += escapeChar + groupStartChar;
                        }
                    }
                } else if (current == groupEndChar) {
                    if (groupingDepth > 0) {
                        if (currentTerm == null) {
                            currentTerm = new QueryTerm();
                            currentTerm.postOp += groupEndChar;
                            arrayOut.push(currentTerm);
                            currentTerm = null;
                            groupingDepth--;
                        } else {
                            if ((next == null) || (next == termSeparator) || (next == groupEndChar)) {
                                arrayOut.push(currentTerm);
                                currentTerm = new QueryTerm();
                                currentTerm.postOp += groupEndChar;
                                arrayOut.push(currentTerm);
                                currentTerm = null;
                                groupingDepth--;
                            } else {
                                if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                                    currentTerm.term += escapeChar + escapeChar;
                                }
                                currentTerm.term += escapeChar + groupEndChar;
                            }
                        }
                    } else {
                        if (currentTerm == null) currentTerm = new QueryTerm();
                        if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                            currentTerm.term += escapeChar + escapeChar;
                        }
                        currentTerm.term += escapeChar + groupEndChar;
                    }
                } else if (shouldEscape.indexOf(current) >= 0) {
                    if (currentTerm == null) {
                        var spos = queryIn.indexOf(termSeparator, pos);
                        var work;
                        if (spos < 0) {
                            work = queryIn.slice(pos);
                        } else {
                            work = queryIn.slice(pos, spos);
                        }
                        currentTerm = new QueryTerm();
                        if (work.match(reIndividualOperator)) {
                            currentTerm.preOp = work;
                            currentTerm.term = "";
                            forceMustOperator = false;
                            pos += (work.length - 1);
                        } else {
                            if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                                currentTerm.term += escapeChar + escapeChar;
                            }
                            currentTerm.term += escapeChar + current;
                        }
                    } else {
                        if (trickEnable && !currentTerm.term.match(reEndWithEscape)) {
                            currentTerm.term += escapeChar + escapeChar;
                        }
                        currentTerm.term += escapeChar + current;
                    }
                } else {
                    if (currentTerm == null) currentTerm = new QueryTerm();
                    currentTerm.term += current;
                }
            }
            pos++;
        }
        if (currentTerm != null) {
            if (currentTerm.term.match(reIndividualOperator) && (arrayOut.length > 0)) {
                currentTerm.preOp = currentTerm.term;
                currentTerm.term = "";
                forceMustOperator = false;
            } else {
                var work = currentTerm.term.replace(rePhraseCharReplace, "");
                if (work.match(reIndividualOperator)) {
                    if (trickEnable) work = escapeChar + escapeChar + work;
                    work = escapeChar + work;
                    if (currentTerm.term.match(rePhraseStart)) work = phraseChar + work;
                    if (currentTerm.term.match(rePhraseEnd)) work = work + phraseChar;
                    currentTerm.term = work;
                }
            }
            arrayOut.push(currentTerm);
        }
        for (var w = 0; w < groupingDepth; w++) {
            currentTerm = new QueryTerm();
            currentTerm.postOp = groupEndChar;
            arrayOut.push(currentTerm);
        }

        var queryOut = "";
        for (var work = 0; work < arrayOut.length; work++) {
            var currentTerm = arrayOut[work];
            if (work > 0) queryOut += " ";
            if (forceMustOperator && (currentTerm.preOp != "+") && (currentTerm.term != "")) queryOut += "+";
            if (!currentTerm.fuzzySearch && (currentTerm.term != "")) {
                if (!currentTerm.term.match(rePhraseStart)) currentTerm.term = phraseChar + currentTerm.term;
                if (!currentTerm.term.match(rePhraseEnd)) currentTerm.term = currentTerm.term + phraseChar;
            }
            queryOut += (currentTerm.preOp + currentTerm.term + currentTerm.postOp);
        }
        return queryOut;
    }

}

AUI().ready(
    'liferay-hudcrumbs', 'liferay-navigation-interaction', 'liferay-sign-in-modal',
    function(A) {
        var navigation = A.one('#navigation');

        if (navigation) {
            navigation.plug(Liferay.NavigationInteraction);
        }

        var siteBreadcrumbs = A.one('#breadcrumbs');

        if (siteBreadcrumbs) {
            siteBreadcrumbs.plug(A.Hudcrumbs);
        }

        var signIn = A.one('li.sign-in a');

        if (signIn && signIn.getData('redirect') !== 'true') {
            signIn.plug(Liferay.SignInModal);
        }
    }
);

AUI().ready(
    /*
     This function gets loaded when all the HTML, not including the portlets, is
     loaded.
     */
    function(A) {

        var pageSearch = A.one('.page-search'),
            dropDown = A.one('.drop-down');

        if (dropDown) {
            var icons = dropDown.all('img');

            if (icons.size() > 0){
                dropDown.addClass('has-icons');
            }else {
                dropDown.addClass('no-icons');
            }

            icons.each(function(node){
                node.addClass('\u0050\u0061\u0067\u0065\u0020\u0049\u0063\u006f\u006e');
                node.ancestor('li').addClass('has-icon');
            });
        }
    }

);



AUI().use(
    'aui-base',

    function(A) {
        var popClicks = A.all('.pop-click');

        var popClickHandle;

        var togglePopClick = function(event) {
            event.stopPropagation();

            var targetNode = event.target;

            if (targetNode.hasClass('pop-click-content') || targetNode.ancestor('.pop-click-content')) {
                return;
            }

            var activePopClick = A.one('.pop-click-active');

            if (activePopClick) {
                activePopClick.removeClass('pop-click-active');
            }

            var currentTargetNode = event.currentTarget;
            if (currentTargetNode.hasClass('pop-click') && (currentTargetNode != activePopClick)) {
                currentTargetNode.addClass('pop-click-active');

                // if selected element is for search - focus on search field
                if (currentTargetNode.one('#keywords')) {
                    var searchField = A.one('#keywords');
                    searchField.focus();
                }

            }

            activePopClick = A.one('.pop-click-active');

            if (activePopClick && !popClickHandle) {
                popClickHandle = A.getDoc().on('click', togglePopClick);
            }
            else if (popClickHandle && !activePopClick) {
                popClickHandle.detach();

                popClickHandle = null;
            }
        };

        popClicks.on('click', togglePopClick);
    }
);


Liferay.Portlet.ready(
    /*
     This function gets loaded after each and every portlet on the page.

     portletId: the current portlet's id
     node: the Alloy Node object of the current portlet
     */
    function(portletId, node) {
    }
);

Liferay.on(
    'allPortletsReady',

    /*
     This function gets loaded when everything, including the portlets, is on
     the page.
     */
    function() {

        /* add message to login for more search results   */
        if (!Liferay.ThemeDisplay.isSignedIn()) {
            var result = AUI().one(".portlet-search .portlet-msg-info");
            if (result) {
                if (result.text().indexOf("No results were found") > 0) {
                    result.append("Please <a href='/login'>sign in</a> to the Developer Portal to find additional search results.");
                }
            }
        }

    }
);

/** Method to display a note on the form if there is any required or mandate field to be entered **/
$(document).ready(function(){
    if($('form').find('.label-required').length > 0 || $('.nin-form').not('.nin-form-disabled').find('.label-required').length > 0)
    {
        var asteriskElement = $('#required-asterisk').find('.req-note-asterisk');
        $('.nin-form:visible:last').append(asteriskElement.clone());
    }
    
    initSearchAssistOption ();
});

/** convert  changeOperator result base on search assist option**/
function stringToOperator (changedKeyWords){
    var retWords = changedKeyWords;
    while(retWords.match(new RegExp("[\+][\"]+[Aa][Nn][Dd]\"","g"))!=null){
        retWords=retWords.replace(new RegExp("[\+][\"]+[Aa][Nn][Dd]\"","g")," AND ");
    }
    while(retWords.match(new RegExp("[\+][\"]+[Nn][Oo][Tt]\"","g"))!=null){
        retWords=retWords.replace(new RegExp("[\+][\"]+[Nn][Oo][Tt]\"","g")," NOT ");
    }
    while(retWords.match(new RegExp("[\+][\"]+[Oo][Rr]\"","g"))!=null){
        retWords=retWords.replace(new RegExp("[\+][\"]+[Oo][Rr]\"","g")," OR ");
    }
    while(retWords.match(new RegExp("[\+\"\\\\]+[AND]\"","g"))=="+\"\\\\\\AND\""){
        retWords=retWords.replace(new RegExp("[\+\"\\\\]+[AND]\"","g")," AND ");
    }
    while(retWords.match(new RegExp("[\+\"\\\\]+[NOT]\"","g"))=="+\"\\\\\\NOT\""){
        retWords=retWords.replace(new RegExp("[\+\"\\\\]+[NOT]\"","g")," NOT ");
    }
    while(retWords.match(new RegExp("[\+\"\\\\]+[OR]\"","g"))=="+\"\\\\\\OR\""){
        retWords=retWords.replace(new RegExp("[\+\"\\\\]+[OR]\"","g")," OR ");
    }
    
    return retWords;
}

/** convert  changeOperator result base on search assist option**/
function searchPattern (changedKeyWords,pattern){
	changedKeyWords=changedKeyWords.replace(/\u3000/g, " ");
    var termArray = changedKeyWords.split(" ");
    var retWords = "";
    for (var cnt = 0; cnt < termArray.length; cnt++) {
    	var term = termArray[cnt];
        if(term==""){
        	continue;
        }else{
        	if(term.toUpperCase().match("^AND$|^NOT$|^OR$")!=null){
                                 term=term.toUpperCase();
        	}
        	if(term.toUpperCase().match("^\"AND\"$|^\"NOT\"$|^\"OR\"$")!=null){
                                 term=term.toUpperCase().match("AND|NOT|OR");
            }	
        }
        if(retWords==""){
        	retWords=term;
        }else{
        	retWords=retWords+" "+pattern+" \""+term + "\"";
        }
    }
    
    return retWords;
}

function assistSearch(assist,keywords){
    switch(assist){
    case "0":
        keywords=searchPattern(keywords,"AND");
        break;
    case "1":
        keywords= '"'+keywords+'"';
        break;
    case "2":
        keywords=searchPattern(keywords,"OR");
        break;
    }
    return keywords;
}

var searchContainer=$("#_3_searchContainer");

/** init assist option for global search**/
function initSearchAssistOption (){
	
    var optionString = '\u002c\u0053\u0065\u0061\u0072\u0063\u0068\u0020\u0061\u0073\u0020\u0061\u0020\u0073\u0069\u006e\u0067\u006c\u0065\u0020\u006b\u0065\u0079\u0077\u006f\u0072\u0064\u002c\u0053\u0065\u0061\u0072\u0063\u0068\u0020\u0066\u006f\u0072\u0020\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u0020\u0074\u0068\u0061\u0074\u0020\u0069\u006e\u0063\u006c\u0075\u0064\u0065\u0073\u0020\u0061\u006e\u0079\u0020\u006f\u0066\u0020\u0074\u0068\u0065\u0020\u006b\u0065\u0079\u0077\u006f\u0072\u0064\u0073\u002c\u0043\u0075\u0073\u0074\u006f\u006d\u0020\u0073\u0065\u0061\u0072\u0063\u0068'.split(',');
    var assistDropDown = document.getElementById("assist-drop-down");
    if(assistDropDown!= null){
        assistDropDown.classList.add("global-search-assist-drop-down");
        for (var i = 0; i < optionString.length; i++) {
            var opt = document.createElement("option");
            opt.value = i;
            opt.innerHTML = optionString[i];
            opt.classList.add("assist-option");
            assistDropDown.appendChild(opt);
        }
        if(searchContainer!= null){
            var searchChildren = searchContainer.children();
            var searchKeywords = searchChildren.find('#_3_keywords');
            searchKeywords.parent().addClass("global-search-result-keyword-container");
            searchKeywords.addClass("global-search-result-keyword");
            var spanContainer = document.createElement("span");
            var resAssistDropDown = assistDropDown.cloneNode(true);
            resAssistDropDown.id="res-assist-drop-down";
            spanContainer.appendChild(resAssistDropDown);
            searchChildren.find(".search-tooltip").parent().append(spanContainer);
        }
        $(".dialog-global-search-error").dialog({
            modal : true,
            autoOpen: false,
            closeOnEscape: true,
            draggable: false,
            position: 'center',
            resizable:false
        });
    }
}

var errMsg= '\u0050\u0075\u0074\u0020\u0071\u0075\u006f\u0074\u0061\u0074\u0069\u006f\u006e\u0020\u006d\u0061\u0072\u006b\u0073\u0020\u0028\u201c\u0029\u0020\u0061\u0072\u006f\u0075\u006e\u0064\u0020\u0045\u006e\u0067\u006c\u0069\u0073\u0068\u0020\u0070\u0068\u0072\u0061\u0073\u0065\u0073\u0020\u0074\u0068\u0061\u0074\u0020\u0069\u006e\u0063\u006c\u0075\u0064\u0065\u0020\u0074\u0068\u0065\u0020\u0077\u006f\u0072\u0064\u0073\u0020\u0041\u004e\u0044\u002c\u0020\u004f\u0052\u002c\u0020\u006f\u0072\u0020\u004e\u004f\u0054\u002e\u003c\u0062\u0072\u003e\u0028\u0049\u0074\u0020\u0069\u0073\u0020\u006e\u006f\u0074\u0020\u0070\u006f\u0073\u0073\u0069\u0062\u006c\u0065\u0020\u0074\u006f\u0020\u0073\u0065\u0061\u0072\u0063\u0068\u0020\u0066\u006f\u0072\u0020\u0074\u0068\u0065\u0020\u0077\u006f\u0072\u0064\u0020\u0041\u004e\u0044\u002c\u0020\u004f\u0052\u002c\u0020\u006f\u0072\u0020\u004e\u004f\u0054\u0020\u006f\u006e\u0020\u0069\u0074\u0073\u0020\u006f\u0077\u006e\u002e\u0029\u003c\u0062\u0072\u003e\u0045\u0078\u0061\u006d\u0070\u006c\u0065\u0073\u003a\u0020\u0022\u004d\u006f\u0072\u0065\u0020\u0069\u0073\u0020\u006e\u006f\u0074\u0020\u0061\u006c\u0077\u0061\u0079\u0073\u0020\u0062\u0065\u0074\u0074\u0065\u0072\u0022\u0020\u0022\u004c\u0069\u0076\u0065\u0020\u0061\u006e\u0064\u0020\u006c\u0065\u0074\u0020\u006c\u0069\u0076\u0065\u0022';
/** check if any error term in changeOperator result **/
function checkErrTerm(words){
    var errNotTerm = words.match(new RegExp("[\+][\"][Nn][Oo][Tt][\"]","g"));
    var errAndTerm = words.match(new RegExp("[\+][\"][Aa][Nn][Dd][\"]","g"));
    var errOrTerm = words.match(new RegExp("[\+][\"][Oo][Rr][\"]","g"));
    var retTerm = "";
    if (errNotTerm != null) {
        retTerm = errNotTerm;
    }
    if (errAndTerm != null) {
    if(retTerm == ""){
        retTerm = errAndTerm;
        }else{
            retTerm = [retTerm,errAndTerm].join(',');
        }
    }
    if (errOrTerm != null) {
        if(retTerm == ""){
            retTerm = errOrTerm;
        }else{
            retTerm = [retTerm,errOrTerm].join(',');
        }
    }
    if(retTerm != ""){
        retTerm=errMsg;
        generateErrorModal();
    }
    return retTerm;
}

function generateErrorModal(){
    $('.global-search-error-dialog').dialog({
        modal: true,
        autoOpen: true,
        title: '\u0045\u0072\u0072\u006f\u0072',
        closeOnEscape: true,
        draggable: false,
        resizable:false,
        width: '720px',
        open: function () {
            $('.global-search-error-message').html(errMsg);
        },
        buttons: [{
            text: "OK",
            click: function() {
                $(this).dialog("close");
            }
        }]
    });
}