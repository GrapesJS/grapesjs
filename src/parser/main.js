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

      /**
       * Parse HTML string and return valid model
       * @param  {string} str HTML string
       * @return {Object}
       */
      parseHtml: function(str){
        return pHtml.parse(str, pCss);
      },

      parseCss: function(str){
        return pCss.parse(str);
      },

    };
  };

  return Parser;

});