var loadAd = function() {
  if(typeof _bsa !== 'undefined' && _bsa) {
    _bsa.init('custom', 'CK7I62QJ', 'placement:grapesjscom', {
      target: '#native-carbon',
      template: '<div id="carbonads">' +
          '<a class="carbon-link" href="##link##" target="_blank" rel="noopener">'+
            '<span class="carbon-wrap">'+
              '<span class="carbon-img">'+
                '<img src="##logo##" alt="" border="0" style="max-width: 130px; padding: 10px; background-color: ##backgroundColor##">'+
              '</span>'+
              '<span class="carbon-text">##description##</span>'+
              '<div class="carbon-cta-c">'+
                '<span class="carbon-cta" style="background-color: ##ctaBackgroundColor##; color: ##ctaTextColor##">##callToAction##</span>'+
              '</div>'+
            '</span>'+
          '</a>'+
        '</div>',
    });
  }
};

(function(){
  var scr = document.createElement('script');
  scr.src = '//m.servedby-buysellads.com/monetization.js';
  scr.onload = loadAd;
  document.head.appendChild(scr);
})();
