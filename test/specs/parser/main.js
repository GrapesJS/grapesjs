var modulePath = './../../../test/specs/parser';

define([
        'Parser',
        modulePath + '/model/ParserHtml'
         ],
  function(
          Parser,
          ParserHtml
          ) {

    describe('Parser', function() {

      ParserHtml.run();

    });
});