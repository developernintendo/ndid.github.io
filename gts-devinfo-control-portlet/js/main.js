$(document).ready(function(){
  const closedStatus = "resolved";
  $('.gts_info .title_status.st-update').text("update");
  $('.gts_info .title_status.st-close').text("resolved");
  if( $("#devinfo-list") != null &&  $("#devinfo-list").length > 0){
    $('#filter-all').addClass("button-selected");
    $('#category-all').addClass("button-selected");
    $('.not-article').css("display","none");
    var articleList = new List('devinfo-list', { valueNames: ['category_item','title_status'] });
    
    var filter = "#filter-open";
    $('#filter-all').click(function() {
      init_button("#filter-all");
      articleList.filter(function(item) {
        return true;
      });
      $('.not-article').css("display",($("#devinfo-list tr").length > 0) ? "none":"block");
    });
    $('#filter-open').click(function() {
      init_button("#filter-open");
      articleList.filter(function(item) {
        if (item.values().title_status !== closedStatus) {
          return true;
        }
        return false;
      });
      $('.not-article').css("display",($("#devinfo-list tr").length > 0) ? "none":"block");
    });
    $('#filter-closed').click(function() {
      init_button("#filter-closed");
      articleList.filter(function(item) {
        if (item.values().title_status == closedStatus) {
          return true;
        }
        return false;
      });
      $('.not-article').css("display",($("#devinfo-list tr").length > 0) ? "none":"block");
    });
    $('#category-all').click(function() {
      init_button(filter);
      articleList.filter(function(item) {
        return fileter(item);
      });
      $('.not-article').css("display",($("#devinfo-list tr").length > 0) ? "none":"block");
    });

    $("#devinfo-list > button[name='category']").click(function() {
      var text = $(this).text();
      $("#devinfo-list > button").removeClass("button-selected");
      $(filter).addClass("button-selected");
      $(this).addClass("button-selected");    
      articleList.filter(function(item) {
        var flag = fileter(item);
        if (flag && item.values().category_item.indexOf(text) >= 0) {
          return true;
        } else {
          return false;
        }
      });
      $('.not-article').css("display",($("#devinfo-list tr").length > 0) ? "none":"block");
    });

    function init_button(name){
      filter = name;
      $("#devinfo-list > button").removeClass("button-selected");
      $(name).addClass("button-selected");
      $('#category-all').addClass("button-selected");    
    }
    function fileter(item){
      if (filter == "#filter-all"){
        return true;
      } else if( filter == "#filter-open" && item.values().title_status !== closedStatus) {
        return true;
      } else if( filter == "#filter-closed" && item.values().title_status == closedStatus) {
        return true;
      } else {
        return false;
      }
    }

    // initialize filter-open
    init_button(filter);
    articleList.filter(function(item) {
      if (item.values().title_status !== closedStatus) {
        return true;
      }
      return false;
    });
    $('.not-article').css("display",($("#devinfo-list tr").length > 0) ? "none":"block");
  }
});
