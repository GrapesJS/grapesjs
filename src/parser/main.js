define(function(require) {

  var Parser = function(config) {

    var c = config || {},
    defaults = require('./config/config'),
    parserCss = require('./model/ParserCss'),
    parserHtml = require('./model/ParserHtml');

    // Set default options
    for (var name in defaults) {
      if (!(name in c))
        c[name] = defaults[name];
    }

    var pHtml = new parserHtml(c);
    var pCss = new parserCss(c);

    return {

      parseHtml: function(str){
        return pHtml.parse(str);
      },

      parseCss: function(str){
        return pCss.parse(str);
      },

    };
  };

  return Parser;

});