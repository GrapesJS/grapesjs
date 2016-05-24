var modulePath = './../../../test/specs/parser';

define([
        'Parser',
        modulePath + '/model/ParserHtml',
        modulePath + '/model/ParserCss'
         ],
  function(
          Parser,
          ParserHtml,
          ParserCss
          ) {

    describe('Parser', function() {

      ParserHtml.run();
      ParserCss.run();

    });
});