$(document).ready(function(){
  var aniEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  var $header = $('section.page-header');
  var viewportH = $(window).height();
  var $root = $('html');
  //$header.css('min-height', viewportH);
  //$('#yourElement').one(aniEnd, doSomething);
  //
  var $win = $(window);
  var $els =  $('.fadeInBlock');

  $('.scroll-link').click(function() {
    var target = $($.attr(this, 'data-target'));
    if( target.length ){
        $root.animate({
            scrollTop: (target.offset().top -70 )
        }, 500);
        return false;
    }
  });

  $win.scroll( function(){
      var winH = $win.height();
      var winScrollT = $win.scrollTop();
      var winBtm = winScrollT + winH;
      $els.each( function(i){
          var $el = $(this);
          if(!$el.hasClass('animated')){
            var $elH = $el.outerHeight();
            var elTopPos = $el.offset().top;
            var elBtm = elTopPos + $elH;
            if( winBtm >= (elTopPos + $elH/4) ){
                $el.addClass('animated fadeIn');//fadeIn fadeInUp zoomIn
            }
          }
      });
  });

  $win.trigger('scroll');
  Gifffer();
})
