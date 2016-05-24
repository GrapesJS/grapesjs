define(function(require) {

  var Parser = function(config) {

    var c = config || {},
    parserCss = require('./model/ParserCss'),
    parserHtml = require('./model/ParserHtml');

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