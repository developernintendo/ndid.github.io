function doRadio() {
	var elements = $("input[name='"+ $("#" + $(window.event.target).attr('for')).attr("name") + "']");
	for ( var i = 0; i < elements.length; i++) {
		$(elements[i]).removeAttr("checked");
	}
	$("#" + $(window.event.target).attr('for')).attr("checked", "checked");
}
function doCheckbox() {
	var input = $("#" + $(window.event.target).attr('for'));
	if( !$(window.event.target).hasClass('active') ) {
		input.attr("checked", "checked");
	} else {
		input.removeAttr("checked");
	}
}
