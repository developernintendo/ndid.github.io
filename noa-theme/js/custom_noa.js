/** Tracking items that need to be page-wide **/
var cleanForm = true;
var savedData = {};

/** BEGIN METHODS THAT NEED TO BE ACCESSIBLE BEFORE PAGE LOAD **/

var NOA = NOA || {};

NOA.Custom = {
    /**
     * Allow for pages to add their own breadcrumb items
     * @param itemName - the String that will appear as the breadcrumb's text
     * @param itemLink - the link (if any) that should be assigned to the breadcrumb
     * @param selectThis - boolean - true if this item should be selected, false if the selection class should remain on the predecessor
     */
    addItemToBreadcrumb: function(itemName, itemLink, selectThis) {

        var text = $('<div/>').html(itemName).text();
        var ul = $(".noa-breadcrumb .nin-breadcrumb");
        var previousLi = ul.find(".dropdown.selected");
        var cloneLi = previousLi.clone(true);
        var innerA = previousLi.find("a:first").clone();

        if(selectThis) {
            previousLi.removeClass("selected");
        } else {
            cloneLi.removeClass("selected");
        }

        innerA.attr("href", itemLink);
        innerA.text(text);
        cloneLi.empty();
        cloneLi.append(innerA);
        ul.append(cloneLi);
    },

    /**
     * Allow for pages to add an item to the current selected breadcrumb dropdown menu
     * @param itemName - the String that will appear as the breadcrumb's text
     * @param itemLink - the link (if any) that should be assigned to the breadcrumb
     * @param selected - boolean - true if this item is the item currently selected
     */
    addItemToBreadcrumbDropdown: function(itemName, itemLink, selected) {

        var text = $('<div/>').html(itemName).text();
        var ul = $(".noa-breadcrumb .nin-breadcrumb");
        var selectedLi = ul.find(".dropdown.selected");

        var dropdownUl = selectedLi.find(".dropdown-menu");
        if (dropdownUl.length == 0) {
            dropdownUl = $(document.createElement('ul'));
            dropdownUl.addClass("dropdown-menu");
            selectedLi.append(dropdownUl);

            var icon = $(document.createElement('i')).addClass("icon-caret-down");
            selectedLi.find("a:first").append(icon);
        }

        var cloneLi = selectedLi.clone(true);
        var innerA = selectedLi.find("a:first").clone();

        cloneLi.removeClass("dropdown");
        cloneLi.removeClass("selected");
        innerA.removeClass("dropdown-toggle");
        if(selected) {
            dropdownUl.find(".selected").removeClass("selected");
            cloneLi.addClass("selected");
        }

        innerA.attr("href", itemLink);
        innerA.text(text);
        cloneLi.empty();
        cloneLi.append(innerA);
        dropdownUl.append(cloneLi);
    },

    addItemsToLeftNav: function(jsonParentItem, jsonChildItems) {
    	var ul = jQuery(".noa-navigation .nin-left-nav");

        var parentLi = jQuery("<li class='nin-parent-nav expanded'><div class='nin-foldout-wrapper'><a href='" + jsonParentItem.navLink + "'>" + jsonParentItem.navTitle + "</a></div></li>");

        for (i = 0; i < jsonChildItems.length; i++) {
        	var childLi = jQuery("<ul class='nin-child-nav'><li><a href='" + jsonChildItems[i].navLink + "'><span>" + jsonChildItems[i].navTitle + "</span></a></li></ul>");

        	parentLi.append(childLi);
        }

        ul.append(parentLi);
    },

    /**
     * Add Message Board categories to the left nav under the Message Boards menu
     */
    appendMessageBoardCategoriesToLeftNav: function(categoriesJSONString, currentPage) {

        //If the categories are already displayed then exit
        var categories = jQuery(".mb-category-nav").size();
        if (categories > 0) {
            return;
        }

        //Get the 1st message board href
        var leftNavMBHref;
        var ninNavParentTitle = $(".noa-navigation .nin-left-nav .selected");
        ninNavParentTitle.children('a').each(function () {
            leftNavMBHref = this.href;
            return false;
        });

        var ninNavParent = ninNavParentTitle.parent().eq(0);
        ninNavParent.addClass("collapsible expanded");

        //Get the json message board categories
        var mbCategoriesNavJson = JSON.parse(categoriesJSONString);

        //Append child menu option, one for each message board category
        var mbCatsUl = $("<ul class='nin-parent-children'/>");
        for (var i = 0; i < mbCategoriesNavJson.length; i++) {

            //Prepare to set the nav item as selected
            var selectedClass = "";
            var currentCategoryName = mbCategoriesNavJson[i].name;
            if(currentPage == currentCategoryName) {
                ninNavParentTitle.removeClass("selected");
                selectedClass = "selected";
            }

            //Add the various lis to the UL
            mbCatsUl.append(
                $("<li class='nin-nav-child mb-category-nav'/>").append(
                    $("<div class='nin-nav-child-title " + selectedClass + "'/>").append(
                        $("<a class='nin-nav-full-width'/>").attr("href", leftNavMBHref + "/-/message_boards/category/" + mbCategoriesNavJson[i].categoryId).append(
                            $("<span/>").html(currentCategoryName)
                        )
                    )
                )
            );
        }

        //Append the child UL and sub Li menus to the message board Li
        ninNavParent.append(mbCatsUl);
    },

    /**
     * Add the given message board category to the bread crumbs
     */
    appendMessageBoardCategoriesToTheBreadCrumb: function(breadcrumbCategoryName, breadcrumbCategoryId) {
        //Get the message board Li from the left nav
        var leftNavMBLi = $(".noa-navigation .nin-left-nav .selected");

        //Get the 1st message board href
        var leftNavMBHref;
        $(".noa-navigation .nin-left-nav .selected .nin-nav-parent-title").children('a').each(function () {
            leftNavMBHref = this.href;
            return false;
        });

        //Append the current category on the breadcrumb
        if (breadcrumbCategoryName != "") {
            NOA.Custom.addMBCategoryToBreadcrumb(breadcrumbCategoryName, leftNavMBHref + "/-/message_boards/category/" + breadcrumbCategoryId, true);
        }
    },

    /**
     * Add message board categories to the breadcrumbs
     * @param itemName - the String that will appear as the breadcrumb's text
     * @param itemLink - the link (if any) that should be assigned to the breadcrumb
     * @param selectThis - boolean - true if this item should be selected, false if the selection class should remain on the predecessor
     */
    addMBCategoryToBreadcrumb: function(itemName, itemLink, selectThis) {

        //If the categories are already displayed then exit
        var categories = jQuery(".mb-category-breadcrumb").size();
        if (categories > 0) {
            return;
        }

        var text = $('<div/>').html(itemName).text();
        var ul = $(".noa-breadcrumb .nin-breadcrumb");
        var previousLi = ul.find(".dropdown.selected");
        var cloneLi = previousLi.clone(true);
        var innerA = previousLi.find("a:first").clone();

        if(selectThis) {
            previousLi.removeClass("selected");
        } else {
            cloneLi.removeClass("selected");
        }

        innerA.attr("href", itemLink);
        innerA.text(text);
        cloneLi.empty();
        cloneLi.append(innerA);
        cloneLi.addClass("mb-category-breadcrumb");
        ul.append(cloneLi);
    },

     // A helper to add a new click event before all other click events
     bindFirstClick: function(object, functionToAdd){
        var events = $._data(object, "events");
        if(events) {
            var clickEvents = events.click;
            var newEvent = {
                type: "click",
                origType: "click",
                data: null,
                handler: functionToAdd,
                guid: jQuery.guid++,
                selector: undefined,
                needsContext: undefined,
                namespace: ""
            };
            clickEvents.unshift(newEvent);
        } else {
            object.click(functionToAdd);
        }
    },

    /**
     * Enable/disable the required label for a form input
     * @param selector - the jQuery selector for the input
     * @param display - true to enable the display, false to disable it
     */
    displayFieldRequiredLabel: function(selector, display) {
        var input = $(selector);
        var content = input.parents('.control-group');
        var label = content.find('.control-label');
        var requiredLabel = label.find('.label-required');
        var helpIcon = label.find('.taglib-icon-help');

        if (requiredLabel.length > 0) {
            requiredLabel.toggle(display);
        } else {
            // Add the required label since it wasn't found
            var html = $("<span/>").addClass("label-required").text("*");
            if (helpIcon.length > 0) {
                helpIcon.before(html);
            } else {
                label.append(html);
            }
            if (!display) {
                label.find('.label-required').toggle(display);
            }
        }
    },

    /**
     * Return the number of UTF-8 bytes in the provided string.
     * Based on http://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript/12206089#12206089
     */
    getUTF8Length: function(value) {
        var len = 0;
        for (var i = 0; i < value.length; i++) {
            var code = value.charCodeAt(i);
            if (code <= 0x7f) {
                len += 1;
            } else if (code <= 0x7ff) {
                len += 2;
            } else if (code >= 0xd800 && code <= 0xdfff) {
                // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
                // (Assume next char is the other [valid] half and just skip it)
                len += 4;
                i++;
            } else if (code < 0xffff) {
                len += 3;
            } else {
                len += 4;
            }
        }
        return len;
    },

    /**
     * Allow breadcrumb links to be updated.
     * @param oldLinkEndingFragment - The string that the old link ends with (e.g., /group/development/reports)
     * @param newLink - The new URL of the link (e.g., https://developer.nintendo.com/group/development/reports?bunch=of&parameters=here)
     */
	replaceBreadcrumbLink: function(oldLinkEndingFragment, newLink) {
		$(".nin-breadcrumb a[href$='" + oldLinkEndingFragment + "']").attr('href', newLink);
	},

    //A helper function to update the formslist
    updateSavedData: function(form) {
        savedData[form.attr("id")] = form.serialize();
        form.find(".show-when-dirty").hide();
    },

    //Check the validation of email addresses
    validateEmail: function(val) {
        /**
         * NOTE: if these RegExes are altered, they must also be updated in the NOAEmailAddressValidator
         */
        var ndidRegex = /^[A-Za-z0-9]+([._\-+%][A-Za-z0-9]+)*@[A-Za-z0-9]+([-.][A-Za-z0-9]+)*\.?[A-Za-z]{2,}$/g;

        /**
         * NOTE: This regex is pulled from aui-form-validator.js.
         */
        var auiRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;

        return (ndidRegex.test(val) && auiRegex.test(val));
    },

    // Validate the value is less than the 4000 byte maximum for a (non-CLOB) string field
    validateMaximumByteLength: function(val, fieldNode, ruleValue) {
        var maximumByteLength = 4000;
        var byteLength = NOA.Custom.getUTF8Length(val);
        if (byteLength > maximumByteLength) {
            console.debug("Field byte length too long: " + byteLength);
            return false;
        }
        return true;
    },

    validateNDID: function(val) {
        var regex = /^[a-zA-Z0-9_.]{5,32}$/;
        return (val.search(regex) > -1);
    },
    //Check the validation of phone number
    validatePhoneNumber: function(val) {
        var regex = /^[+\-\.\s\(\)\uFF0B\uFF0D\uFF0E\uFF00\uFF08\uFF09\d\uFF10-\uFF19]+$/;
        return regex.test(val);
    },

    // validate ap tax code in tax form
    validateApTaxCode: function(val) {
        var stringArray = val.split('|');
        if (stringArray.length==2){
            val=stringArray[0].trim() + ' | '+stringArray[1].trim();
            $(".ap-code").val(val);
            return true;
        }else{
            return false;
        }
    },

    //validate input field for BMS code in Save BMS Code form
    validateBMSCode: function(val) {
        var BMSCODE_REGEX = /^[A-Z0-9]*$/;
        return BMSCODE_REGEX.test(val);
    },

    //validate inout fields for Romaji char only
    validateRomajiChar: function(val) {
        var ROMAJI_REGEX = /^[\x20-\x7E\s]*$/;
        return ROMAJI_REGEX.test(val);
    },

    //check if the field has any Kanji / halfwidth katakana
    hasKanji: function(paramName){
        var  KANJI_REGEX = /[\u4E00-\u9FAF\uFF00-\uFFEF\u3040-\u309F\u30FC]/;
        return KANJI_REGEX.test(paramName);
    },

    //check if the field has any fullwidth katakana
    hasFullWidthKatakana: function (paramName){
        var  FULL_WIDTH_KATAKANA_CHAR_REGEX = /[\u30a0-\u30ff]/;
        return FULL_WIDTH_KATAKANA_CHAR_REGEX.test(paramName);
    },

    //check if the field has any fullwidth katakana and allow half-width Kana character Ke (i.e. “ヶ”)
    hasFullWidthKatakanaExceptHalfWidthKE: function (paramName){
        var  FULL_WIDTH_KATAKANA_CHAR_REGEX_EXCEPT_KE = /[\u30A0-\u30FF&&[^\u30F6]]+/;
        return FULL_WIDTH_KATAKANA_CHAR_REGEX_EXCEPT_KE.test(paramName);
    },

    //check if the Date Object is valid
    isDate: function (dateObj){
        return (dateObj instanceof Date && !isNaN(dateObj.valueOf()));
    },

/*

 Customization of AUI input file uploader
 This functions adds extra elements to aui input field and customizes the Look

 */
    customAuiFileUploader: function (elementClass, buttonLabel , locale) {

        $(elementClass).wrap($("<div/>"));
        $(elementClass).before($("<input/>").attr({class:"field nin-upload-filename nin-input-file",type:"text",name:"",value:"",disabled:"true"}));

        if(locale == "ja_JP"){
            $(elementClass).wrap($("<label/>").attr({class:"nin-btn nin-btn-upload btn-upload-jp"}));
        }else{
            $(elementClass).wrap($("<label/>").attr({class:"nin-btn nin-btn-upload"}));
        }
        $(elementClass).before($("<span/>").text(buttonLabel));
    },

    /* End Customization of AUI input file uploader */


    /*
      Show uploaded filename in a text box
    */
    customAuiFileUploaderInputFileName: function (val,errorMsg) {

        var $filename = $(val).val();

        if ($filename != "") {
            var filenamewithoutpath = $filename.replace(/C:\\fakepath\\/i, '');
            $(val).parent().parent().find(".nin-upload-filename").val(filenamewithoutpath);
            $(val).parent().parent().parent().find(".help-inline").remove();
        }else{

            $(val).parent().parent().find(".nin-upload-filename").val('');

            var $req = $(val).attr("aria-required");
            if(!$req){ return; }

            $(val).parent().parent().parent().find(".help-inline").remove();
            $(val).parent().parent().after($("<div/>").attr({class:"form-validator-stack help-inline"}).append($("<div/>").attr({class:"required",role:"alert"}).text(errorMsg)));
        }

    },

    /*
      Custom Validation Message for Custom File Upload
    */
    customAuiFileUploaderValidateMsg: function (val,errorMsg) {

        var $req = $(val).attr("aria-required");
        if(!$req){ return; }

        var $filename = $(val).val();
        if ($filename == "") {
            $(val).parent().parent().parent().find(".help-inline").remove();
            $(val).parent().parent().after($("<div/>").attr({class:"form-validator-stack help-inline"}).append($("<div/>").attr({class:"required",role:"alert"}).text(errorMsg)));
        }
    },

    /*
     Disable Or Enable Button
     */
    ninDisableOrEnableButton: function (btnElem, validatePass){
        if(validatePass) {
            $(btnElem).removeAttr('disabled');
            $(btnElem).removeClass('disabled');
        } else {
            $(btnElem).attr('disabled','disabled');
            $(btnElem).addClass('disabled');
        }
    },
    /*
      Add custom success or message for aui alert
     */
     ninAddCustomAuiAlertValidation: function (isValid, alertClassName, errorMsg, element, parentElement){
		if (isValid) {
            NOA.Custom.ninAddCustomAuiSuccessAlertValidation(element, parentElement);
		} else {
            NOA.Custom.ninAddCustomAuiErrorAlertValidation(alertClassName, errorMsg, element, parentElement);
		}
    },
    /*
     * Add custom aui success validation
     */
    ninAddCustomAuiSuccessAlertValidation: function (element, parentElement){
        //Remove previous if exists error message
        parentElement.children(".form-validator-stack").remove();
        //Update css classes
        element.removeClass("error-field");
        parentElement.removeClass("error");
        element.addClass("success-field");
        parentElement.addClass("success");
    },
    /*
     * Add custom aui error validation
     */
    ninAddCustomAuiErrorAlertValidation: function (alertClassName, errorMsg, element, parentElement){
        //Remove previous if exists error message
        parentElement.children(".form-validator-stack").remove();
        //Show error message
        var alertElementHTML = ($("<div/>").attr({class:"form-validator-stack help-inline"}).append($("<div/>").attr({class: alertClassName,role:"alert"}).text(errorMsg)));
        parentElement.append(alertElementHTML);
        //Update css classes
        element.removeClass("success-field");
        parentElement.removeClass("success");
        element.addClass("error-field");
        parentElement.addClass("error");
    },
    /*
     * Return whether all Required validation satisfied
     */
    ninValidateRequiredElement: function(element, errorMsg) {
		var isValid = true;
		var elementIsVisible = element.is(":visible");
		if (elementIsVisible) {
			var value = element.val();
			isValid = value!=null && value.trim()!="";
			var parentElement = element.parent();
			if (element.hasClass('selected-org-name')) {
				parentElement = parentElement.parent();
			}
			NOA.Custom.ninAddCustomAuiAlertValidation(isValid, "required", errorMsg, element, parentElement);
		}
		return isValid;
	},

    /* Search Partner company in popup window
     * We can Directly call ninSetupPartnerSearch()
     * start
     */
    ninSetupPartnerSearch: function(searchIcon, searchStringInput, resultsTable, name, uuid, address, email, languageURL){
       //Org Search listener - triggers the ajax call to do the search
        searchIcon.click(function(e) {
            NOA.Custom.doSearch(searchStringInput.val(), resultsTable, name, uuid, address, email, languageURL);
            e.preventDefault();
        });

        searchStringInput.keypress(function(e) {
            if (e.keyCode == 10 || e.keyCode == 13) {
                NOA.Custom.doSearch(searchStringInput.val(), resultsTable, name, uuid, address, email, languageURL);
                e.preventDefault();
            }
        });
    },
    selectedFromOrgCapture:{"empty" : "empty"},
    selectedOrgCapture: {"empty" : "empty"},
    doSearch: function(searchString, resultsTable, name, uuid, address, email, languageURL) {
        console.debug("Calling Partner Search with search string :  " + searchString);
        var pageSize = -1;

        //Here, -1 is passed as the start and end values to tell the Liferay Service to return all values that
        //match the search query. It's the equivalent of using QueryUtil.ALL_POS.
        Liferay.Service(
                '/noa-company-admin-portlet.partnersearch/get-partners',
                {
                    orgSearchString: searchString,
                    start: -1,
                    end: pageSize
                },
                function(obj) {
                    NOA.Custom.handleSearchResults(obj, resultsTable, name, uuid, address, email, languageURL);
                }
        );
    },
    handleSearchResults: function (searchResults, resultsTable, name, uuid, address, email, languageURL){
        var data = NOA.Custom.formatSearchResults(searchResults);
        //Build data table to show search results
        resultsTable.empty();
        var table =  resultsTable.DataTable({
            "destroy" : true,
            "info"      : false,
            "searching" : false,
            "ordering" : false,
            "pageLength": 4,
            "order"     : [],
            "data"      : data,
            "columns"   : [
                { "data" : "org", render : NOA.Custom.radioRenderer},
                { "data" : "org.name", title : name },
                { "data" : "org.uuid", title : uuid },
                { "data" : "org.address", title : address },
                { "data" : "org.email", title : email}
            ],
            "language": {
                "url": languageURL
            },
            "drawCallback": function(){
                NOA.Custom.registerRadioClickListener();
            }
        });

        NOA.Custom.showButtonRow(resultsTable);
    },
    formatSearchResults: function (orgList){
        var formattedOrgs = [];
        $.each(orgList, function(key, value){
            var org = {"org" : {"id": value.id, "name" : value.name, "uuid" : value.uuid, "email" : value.email, "address" : value.address}};
            formattedOrgs.push(org);
        });
        return formattedOrgs;
    },
    radioRenderer: function ( data, type, full, meta ) {
        var selectedOrganizationData = {"id": data.id, "name" : data.name, "uuid" : data.uuid,  "email" : data.email};
        return  "<input type='radio' name='orgSelector' class='org-select-radio' value='"  + JSON.stringify(selectedOrganizationData) + "'/>";
    },
    registerRadioClickListener: function (){
        var orgRadio = $('.org-select-radio');
        orgRadio.change(function(e) {
            if($(this).closest("table").hasClass("from-org-search-results")){
                NOA.Custom.selectedFromOrgCapture = JSON.parse( $(this).val() );
            }else{
                NOA.Custom.selectedOrgCapture = JSON.parse( $(this).val() );
            }
            NOA.Custom.showChoosePartnerButton();
        });
    },
    showButtonRow: function (resultsTable){
        resultsTable.closest(".ui-dialog").find(".choose-partner-button-row:hidden").removeClass('hide');
    },
    showChoosePartnerButton: function() {
        var button = $('.choose-selected-partner-button');
        if(button.hasClass("disabled")){
            button.removeClass("disabled");
        }
    },
    /*Search Partner company in popup window
     * end
     */

    /*
        Show Sticky content
    */
    ninStickyContent: function(elementId){
        if ($(elementId).length) {
            var top = $(elementId).offset().top;
            window.onscroll = function () {
                var y = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
                if (y >= top) {
                    $(elementId).css("position", "fixed");
                }
                else {
                    $(elementId).css("position", "absolute");
                }
            };
        }
    },

    /*
     Style radio inputs
     */
    ninStyleRadioInputs: function() {


        $(".nin-form input[type='radio']").each(function() {

            // add 'selected' class to checked radios
            if ($(this).is(':checked')) {
                if($(this).prop("disabled")) {
                    $(this).parent("label").removeClass('selected');
                    $(this).parent("label").addClass('disabled-selected');
                } else {
                    $(this).parent("label").removeClass('disabled-selected');
                    $(this).parent("label").addClass('selected');
                }
            }

            // add 'radio-inline' class to all radios
            if ($(this).parent("label").not('.radio-inline')) {
                $(this).parent("label").addClass('radio-inline');
            }

            //show in single line if 'radios-single-row' class is present
            var $par = $(this).parent().parent().parent();
            if ($par.hasClass('radios-single-row')) {
                $par.addClass('row-fluid');
                $(this).parent().parent().wrap('<div class="span6"></div>');
            }

        });

        $(".nin-form").on("click", "input[type='radio']", function() {

            var radioGroup = $(this).attr('name');

            // add 'selected' class to clicked radio
            if($(this).is(':checked')){
                $(this).parent().addClass("selected");
            }

            // remove 'selected' class from all other radios in the same radioGroup
            $("input[type='radio']").not(this).each(function() {
                if (radioGroup === $(this).attr('name')) {
                    $(this).parent().removeClass("selected");
                }
            });

        });
    },

    /*
     Style checkbox inputs
     */
    ninStyleCheckboxes: function() {


        $(".nin-form input[type='checkbox']").each(function() {

            // add 'selected' class to checked checkboxes or 'disabled-selected' class to disabled checked ones
            if ($(this).is(':checked')) {
                if($(this).prop("disabled")) {
                    $(this).parent("label").removeClass('selected');
                    $(this).parent("label").addClass('disabled-selected');
                } else {
                    $(this).parent("label").removeClass('disabled-selected');
                    $(this).parent("label").addClass('selected');
                }
            }else{
                if($(this).hasClass("nin-checksheet-checkbox-inherit")){  //for inheritance related checkboxes
                    $(this).prop("disabled") ? $(this).parent("label").addClass('disabled') : $(this).parent("label").removeClass('disabled');
                }else{
                    $(this).prop("disabled") ? $(this).parent("label").addClass('disabled-general') :  $(this).parent("label").removeClass('disabled-general');
                }
            }

        });

        // toggle 'selected' class on the checkbox's label
        $(".nin-form").on("click", "input[type='checkbox']", function(e) {
            e.stopPropagation();
            if ($(this).is(':checked')) {
                var isSelected = $(this).parent().hasClass('selected');
                if(!isSelected){ $(this).parent().addClass('selected'); }
            }else{
                 $(this).parent().removeClass('selected');
            }
        });
    },
    /*
     Update checkbox disabled or enable based on condition
     */
    ninUpdateCheckboxDisabled : function(isEnabled, field){
        if(isEnabled){
            field.prop('disabled', false).removeClass("disabled");
        }else{
            field.prop('disabled', true).addClass("disabled");
        }
        field.prop("disabled") ? field.parent("label").addClass('disabled-general') : field.parent("label").removeClass('disabled-general');
    },
    /*
     Add Calendar Icon to datepicker AUI field
     */
    ninAddCalendarIconDatepicker: function(element) {
        element.siblings(".control-label").removeAttr("for");
        element.wrap($("<div/>").attr({class:"date-field-wrap"}));
        element.before($("<i>").attr({class:"fa fa-calendar date-picker-icon"}));
        $(element).parent(".date-field-wrap").find(".date-picker-icon").click(function(){
            element.datepicker("show");
        });
    },
    /*
     Move and customize given Time element next to given Date element
     */
    ninMoveTimeNextToDatePicker: function(dateElem , timeElem) {

        var dateFieldWrap = dateElem.parent(".date-field-wrap");

        dateFieldWrap.addClass("has-time");
        dateFieldWrap.after($("<div />",{ "class" : "time-field-wrap"}));

        timeElem.appendTo(dateFieldWrap.siblings(".time-field-wrap"));
    },
    /*
     Add Loader next to any element/button with cssclass ".btn-loading-feature" inside ".nin-form"
     It will take the label for loader from 'data-loader-label' attribute of the element
     */
    ninAddLoaderToElement: function() {
        $elem = $(".nin-body-content").find(".btn-loading-feature");
        if($elem.length > 0){
            $elem.before($("<span />",{ "class" : "nin-loader-global pull-left"}));
            var loaderLbl = $elem.attr("data-loader-label");
            if (typeof loaderLbl !== typeof undefined && loaderLbl !== false) {
                $elem.siblings(".nin-loader-global").append(loaderLbl);
            }
            $elem.siblings(".nin-loader-global").append($("<i />",{ "class" : "fa fa-spinner fa-spin"}));
        }
    },
    /*
     Add Loader next to specific button in dialog box with cssclass ".btn-loading-feature"
     It will take the label for loader from 'data-loader-label' attribute of the element
     */
    ninAddLoaderToDialogBtn: function($elem) {
        if($elem.length > 0){
            $elem.wrap($("<div />",{ "class" : "nin-dialog-btn-save-wrap pull-right"}));
            $elem.before($("<span />",{ "class" : "nin-loader-global pull-left"}));
            var loaderLbl = $elem.attr("data-loader-label");
            if (typeof loaderLbl !== typeof undefined && loaderLbl !== false) {
                $elem.siblings(".nin-loader-global").append(loaderLbl);
            }
            $elem.siblings(".nin-loader-global").append($("<i />",{ "class" : "fa fa-spinner fa-spin"}));
        }
    },
    /*
     Global function to set form as disabled
     */
    ninFormDisabledState: function($elem) {

        //disable all elements
        $elem.find("input, textarea, select").attr("disabled",true);

        $elem.find(".date-picker-icon").addClass('disabled');

        //reset checkbox styles
        NOA.Custom.ninStyleCheckboxes();

        //reset radio styles
        NOA.Custom.ninStyleRadioInputs();

    },
    /*
     Helper function to convert String to array
     e.g. "[a,b,c]" -> ["a","b","c"]
     */
    convertStringToArray: function(value) {
        if (value) {
            var a = value.replace('[', '');
            a = a.replace(']', '');
            a = a.replace(/\s/g, '');
            return a.split(',');
        } else {
            return value;
        }
    }

};

/** END METHODS THAT NEED TO BE ACCESSIBLE BEFORE PAGE LOAD **/

$(document).ready(function(){
    /**
     * A method to convert a form into a map of key/value pairs
     * */
    $.fn.trimForm = function(){
        var $newData = {};
        $(this).find(":input").each(function($idx, $elem){
            if($elem.type == "checkbox" || $elem.type == "radio") {
                if($elem.checked) {
                    $newData[$elem.name] = $elem.value;
                }
            } else {
                $newData[$elem.name] = $elem.value;
            }
        });
        return JSON.stringify($newData);
    };

    /**
     * A method to make sure that help message boxes have the text wrap
     * so that overly large strings do not run out of the window.
     */
    $(".nin-form .taglib-icon-help").mouseover(function(){
        $(".aui .yui3-widget-bd").css("word-wrap", "break-word");
    });

    /** BEGIN FORM DIRTINESS ALERT LOGIC **/
    //The list of forms on the page
    //(Add the class "nin-never-dirty" to any item that should not have the dirtiness check applied to it)
    var $formList = $("form:not(.navbar-form,.sign-in-form,.project-search-form,.nin-never-dirty)");

    //A function to prepare the page
    function preparePage() {
        $formList.each(function() {
            NOA.Custom.updateSavedData($(this));

            $(this).change(function(){
                cleanForm = false;
                $(this).find(".show-when-dirty").show();
            });

            $(this).find('button:submit').each(function(){
                // If the user has clicked the "submit" button for any relevant form,
                // we'll ignore the check for cleanliness at the end
                $(this).click(function(){
                    cleanForm = true;
                });
            });
        });
    }

    // On page load, get the original contents of the form
    preparePage();

    // Add the class "nin-save-form" to any item that should reset form dirtiness on click
    // If an item with the class "nin-save-form" is clicked, we reset the tracking data that we have.
    //TODO: consider removing this completely in favor of adding updateSavedData to all AJAX save methods
    $(".nin-save-form").click(function(){
        $formList.each(function() {
            NOA.Custom.updateSavedData($(this));
        });
    });

    // Send out an alert if the form is dirty
    // TODO: There may be a better way to handle this notification, but for now, this is the chosen solution
    window.addEventListener("beforeunload", function (e) {
        if(!cleanForm) {
            var formIsDirty = false;

            $formList.each(function(){
                if(savedData[$(this).attr("id")] != $(this).serialize()) {
                    formIsDirty = true;
                }
            });

            if (formIsDirty) {
                var dirtyFormAlert = getLocalizedDirtyFormAlert();
                (e || window.event).returnValue = dirtyFormAlert; // Gecko and Trident
                return dirtyFormAlert; // Gecko and WebKit
            }
        }
    });
    /** END FORM DIRTINESS ALERT LOGIC **/

    //Make it so that nav items cannot be rearranged, deleted, or edited
    var $ninNav = $(".nin-portal-nav");
    $ninNav.removeClass("sort-pages");
    $ninNav.removeClass("modify-pages");

    /** GLOBAL HOVER SETUP **/
    var dropdownSel = ".dropdown-menu";
    var megaMenuSel = "#nin-crossportal-nav";

    // Fade the menu out (0 opacity) and hide the element
    // once the fadeout is complete.
    function handlerOut(){
        // If this was fired from the megamenu,
        // we need to un-hide Mario. Fire this first
        // so the animations appear to be simultaneous.
        if($(this).parents(megaMenuSel).length > 0){
            $(".mario").stop().fadeTo('fast', 1).show();
        }

        // Hide the contents of the dropdown
        $(this).find(dropdownSel).stop().fadeTo('fast', 0, function(){
            $(this).hide();
        })
    }
    /** END GLOBAL HOVER SETUP **/

    /** BEGIN TOP MENU BAR HOVER **/
    var actionBarDropdowns =  $("#nin-quick-nav").find(".dropdown");
    var megaMenuDropdown =  $("#nin-crossportal-nav").find(".dropdown");

    // The UX proposal is that the top menu bar dropdowns open by 'click'
    // only. This handler filters out all other events.
    function actionBarHandlerIn(ev){
        if(ev.type === "click") {
            $(this).find(dropdownSel).stop().fadeTo('fast', 1).show();

            // If this was fired from the megamenu, we need to
            // hide Mario.
            if($(this).parents(megaMenuSel).length > 0 && !$(this).hasClass("agreements-nav")){
                $(".mario").stop().fadeTo('fast', 0, function() {
                    $(this).hide();
                });
            }
        }
    }

    // Configuration options for the top menu bar items
    var actionBarHoverConfig = {
        sensitivity: 2,
        interval: 100,
        over: actionBarHandlerIn,
        timeout: 500,
        out: handlerOut
    };

    // Set up hoverIntent on the top menu bar dropdowns,
    // with the activator for opening set up as a click instead
    actionBarDropdowns.hoverIntent(actionBarHoverConfig).click(actionBarHandlerIn);
    megaMenuDropdown.hoverIntent(actionBarHoverConfig).click(actionBarHandlerIn);

    // Be able to close the menu by clicking on the toggle as well.
    function clickToClose(evt){
        if(evt.type === "click" && $(this).next(".dropdown-menu").css('display') == "block"){
            evt.preventDefault();
            evt.stopImmediatePropagation();

            // Trick hoverIntent into thinking we've left hovering the element temporarily
            $(this).trigger({
                type:"mouseout",
                pageX:"0",
                pageY:"0"
            });

            // TODO: refactor so this can just call handlerOut()
            if($(this).parents(megaMenuSel).length > 0){
                $(".mario").stop().fadeTo('fast', 1).show();
            }
            $(this).next(".dropdown-menu").stop().fadeTo('fast', 0, function(){
                $(this).hide();
            })
        }
    }
    $("#nin-quick-nav a.dropdown-toggle").click(clickToClose);
    $("#nin-crossportal-nav a.dropdown-toggle").click(clickToClose);

    /** END TOP MENU BAR HOVER **/

    /** BREADCRUMB HOVER **/
    var breadcrumbDropdown = $(".nin-breadcrumb").find(".dropdown");

    // The breadcrumb doesn't require a click event.
    function breadcrumbHandlerIn(){
        $(this).find(dropdownSel).stop().fadeTo('fast', 1).show();
    }

    // Configuration options for the breadcrumb dropdowns
    var breadcrumbHoverConfig = {
        sensitivity: 2,
        interval: 100,
        over: breadcrumbHandlerIn,
        timeout: 300,
        out: handlerOut
    }

    // Set up a vanilla instance of hoverIntent for the breadcrumbs
    breadcrumbDropdown.hoverIntent(breadcrumbHoverConfig);
    /** END BREADCRUMB HOVER **/

    // Left navigation child nav expand/collapse
    $(".nin-foldout-wrapper > .icon-caret-down").click(function() {
        var $foldout = $(this).parent();
        var $ninParentNav = $foldout.parent();
        var $childnav = $ninParentNav.children("ul");

        //Do the animation
        $childnav.slideToggle(200);

        //Add or remove the "expanded" class
        var addOrRemoveExpand = $ninParentNav.hasClass("expanded");
        $ninParentNav.toggleClass("expanded", !addOrRemoveExpand);

        //Add or remove the "hidden" class
        var addOrRemoveHidden = $childnav.hasClass("hidden");
        $childnav.toggleClass("hidden", !addOrRemoveHidden);

    });

    // Megamenu - set column width % based on # of columns
    var megamenus = $("#navigation .megamenu");
    var banner = $("#banner");
    megamenus.each( function() {
        var menu = this;
        var cols = menu.all("ul");
        var size = cols.size();
        menu.addClass("menu"); //("menu" + size);
        cols.each( function() {
            var col = this;
            col.addClass("cols" + size);
        });
        menu.setStyle("width",  banner.get("offsetWidth") + "px");
    });

    // Resize the megamenu width along with browser window
    window.onresize = function(event) {
        megamenus.css("width",  banner.get("offsetWidth") + "px");
    };

    function clearAddresses(addressType) {

        if (addressType == 'business') {
            var stepIndex = 3;
        } else if (addressType == 'development') {
            var stepIndex = 4;
        }

        // populate fields
        var wizardSection = $(".wizard-section-" + stepIndex);
        $(wizardSection).find("input[id*='address1']").val('');
        $(wizardSection).find("input[id*='address2']").val('');
        $(wizardSection).find("input[id*='city']").val('');
        $(wizardSection).find("input[id*='state']").val('');
        $(wizardSection).find("input[id*='postal_code']").val('');
        $(wizardSection).find("input[id*='country']").val('');
        $(wizardSection).find("input[id*='phone']").val('');

        $(wizardSection).find("input[id*='secure_locationCheckbox']").attr('checked', false);
        $(wizardSection).find("input[id*='secure_location']").val(false);
        $(wizardSection).find("textarea[id*='description_secure_location']").val('');
    }

    function copyLegalAddressTo(addressType) {

        // store legal address variables
        var companyAddressLegal = $('#company-address-legal');
        var legalAddress1 = $(companyAddressLegal).find('address-street1').html();
        var legalAddress2 = $(companyAddressLegal).find('.address-street2').html();
        var legalCity = $(companyAddressLegal).find('.address-city').html();
        var legalState = $(companyAddressLegal).find('.address-region').html();
        var legalPostal = $(companyAddressLegal).find('.address-zip').html();
        var legalCountry = $(companyAddressLegal).find('.address-country').html();
        var legalPhone = '';
        var legalSecure = $(".wizard-section-2 input[id*='secure_location']").val();
        var legalSecureDesc = $(".wizard-section-2 textarea[id*='description_secure_location']").val();

        //console.log('secure: ' + legalSecure);
        //console.log('secure desc: ' + legalSecureDesc);

        // set the step selector based on address type
        if (addressType == 'business') {
            var stepIndex = 3;
        } else if (addressType == 'development') {
            var stepIndex = 4;
        }

        // populate fields
        var wizardSection = $(".wizard-section-" + stepIndex);
        $(wizardSection).find("input[id*='address1']").val(legalAddress1);
        $(wizardSection).find("input[id*='address2']").val(legalAddress2);
        $(wizardSection).find("input[id*='city']").val(legalCity);
        $(wizardSection).find("input[id*='state']").val(legalState);
        $(wizardSection).find("input[id*='postal_code']").val(legalPostal);
        $(wizardSection).find("input[id*='country']").val(legalCountry);
        $(wizardSection).find("input[id*='phone']").val(legalPhone);

        if (legalSecure == 'true') {
            $(wizardSection).find("input[id*='secure_locationCheckbox']").attr('checked', 'checked');
            $(wizardSection).find("input[id*='secure_location']").val(true);
            $(wizardSection).find("textarea[id*='description_secure_location']").val(legalSecureDesc);
        }
    }

    // move legal address to under STEP 3
    if ($('#org-wrapper')) {


        // first check if there is a legal address
        if ($('#no-legal-address-set').length == 0) {


            $('#org-wrapper').insertAfter('.wizard-section-2 h3').show();

            // detect checkbox for DEV && BIZ address
            $(".wizard-section-2 input[id*='same_address_businessCheckbox']").change(function() {

                if (this.checked) {
                    copyLegalAddressTo('business');
                } else {
                    clearAddresses('business');
                }

            });
            // detect checkbox for DEV && BIZ address
            $(".wizard-section-2 input[id*='same_address_developmentCheckbox']").change(function() {

                if (this.checked) {
                    copyLegalAddressTo('development');
                } else {
                    clearAddresses('development');
                }

            });


        } else {

            $('#content-wrapper').prepend('<h3>No legal address</h3><p>A company legal address is required before you can request additional platforms.  Please contact Nintendo to assist.</p>');

            $('#main-content').hide();
        } // end if
    } // end if

    // Avoid highlighting tooltips when tabbing through forms
    $(".taglib-icon-help").children('img').attr('tabindex', -1);
    
    /** BEGIN NAVIGATION FOOTER LOGIC **/
    //Reference Items
    var verticalNav = $(".nin-vertical-nav").eq(0);
    var stickyFooter = $(".nin-bottom-navigation-bar").eq(0);
    var megamenuFooter = $(".nin-mega-footer").eq(0);

    //Variables
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var verticalNavWidth = 0;
    var verticalNavLeftOffset = 0;
    if(verticalNav.size() != 0) {
        verticalNavWidth = verticalNav.width();
        verticalNavLeftOffset = verticalNav.offset().left;
    }

    //Make sure the variables can be updated
    var updateNavbarValues = function(){
        scrollTop = $(window).scrollTop();
        windowHeight = $(window).height();
        windowWidth = $(window).width();
        verticalNavWidth = 0;
        verticalNavLeftOffset = 0;
        if(verticalNav.size() != 0) {
            verticalNavWidth = verticalNav.width();
            verticalNavLeftOffset = verticalNav.offset().left;
        }
    };

    //Make sure the navigation bar is anchored at the correct position
    var updateNavbarPosition = function(){
        if((scrollTop + windowHeight) > megamenuFooter.offset().top) {
            var bottomValue = megamenuFooter.height() - ($(document).height() - scrollTop - windowHeight);
            stickyFooter.css("bottom", bottomValue);
        } else {
            stickyFooter.css("bottom", 0);
        }
    };
    updateNavbarPosition();

    //Make sure the navigation bar is the correct width
    var updateNavbarWidth = function(){
        if(verticalNav.css("display") == "none") {
            stickyFooter.css("width", "100%");
        } else {
            stickyFooter.css("width", windowWidth - verticalNavWidth - verticalNavLeftOffset - 1);
        }
    };
    updateNavbarWidth();

    //When the window loads, make sure everything is good to go
    $(window).load(function(){
        updateNavbarValues();
        updateNavbarWidth();
        updateNavbarPosition();
    });

    //When the user scrolls, make sure that all sizes, locations, and values are correct
    $(window).scroll(function(){
        updateNavbarValues();
        updateNavbarPosition();
    });

    //When the user resizes the window, make sure that all sizes, locations, and values are correct
    $(window).resize(function(){
        updateNavbarValues();
        updateNavbarWidth();
        updateNavbarPosition();
    });
    /** END NAVIGATION FOOTER LOGIC **/

    //When the user resizes the window, make sure opened dialog show in the center.
    $(window).resize(function() {
        $(".ui-dialog:visible .ui-dialog-content:not(.nin-fix-position-dialog)").dialog("option", "position", {my: "center", at: "center", of: window});
    });

    //Make the element sticky
    NOA.Custom.ninStickyContent(".nin-page-icon");

    //Style radio inputs
    NOA.Custom.ninStyleRadioInputs();

    //Style checkboxes
    NOA.Custom.ninStyleCheckboxes();

    //Loader Icon
    NOA.Custom.ninAddLoaderToElement();
});
