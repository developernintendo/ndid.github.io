$(function() {
    $(".mobile-icon").click(function () {
        $(".mobile-close").toggle();
        $(".nin-vertical-nav-elements").toggleClass('mobile-show');
        $(".nin-vertical-nav").toggleClass('mobile-show');
        $(".nin-top-nav").toggleClass('mobile-show');
    });

    $(".mobile-close").click(function () {
        $(".mobile-close").hide();
        $(".mobile-icon").show();
        $(".nin-vertical-nav-elements").removeClass('mobile-show');
        $(".nin-vertical-nav").removeClass('mobile-show');
        $(".nin-top-nav").removeClass('mobile-show');
    });
});