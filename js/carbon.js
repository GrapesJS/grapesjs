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

var loadScript = function(src, clb) {
  var scr = document.createElement('script');
  scr.src = src;
  clb && (scr.onload = clb);
  document.head.appendChild(scr);
  return scr;
};

function BSANativeCallback (a) {
  var total = a.ads.length;
  if (!total) {
    var script = loadScript('//cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=grapesjscom');
    script.setAttribute('id', '_carbonads_js');
    var adCont = document.getElementById('native-carbon');
    adCont && adCont.appendChild(script);
  }
}

loadScript('//m.servedby-buysellads.com/monetization.js', loadAd);
