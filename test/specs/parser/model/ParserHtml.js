var path = 'Parser/';
define([path + 'model/ParserHtml',],
  function(ParserHtml) {

    return {
      run : function(){

        describe('ParserHtml', function() {
          var obj;

          beforeEach(function () {
            obj = new ParserHtml();
          });

          afterEach(function () {
            delete obj;
          });

          it('Simple div node', function() {
            var str = '<div></div>';
            var result = { tagName: 'div'};
            obj.parse(str).should.deep.equal(result);
          });

          it('Simple article node', function() {
            var str = '<article></article>';
            var result = { tagName: 'article'};
            obj.parse(str).should.deep.equal(result);
          });

          it('Node with attributes', function() {
            var str = '<div id="test1" class="test2 test3" data-one="test4" strange="test5"></div>';
            var result = {
              tagName: 'div',
              classes: ['test2', 'test3'],
              attributes: {
                'data-one': 'test4',
                id: 'test1',
                'strange': 'test5'
              }
            };
            obj.parse(str).should.deep.equal(result);
          });

          it('Parse style string to object', function() {
            var str = 'color:black; width:100px; test:value;';
            var result = {
              color: 'black',
              width: '100px',
              test: 'value',
            };
            obj.parseStyle(str).should.deep.equal(result);
          });

          it('Parse class string to array', function() {
            var str = 'test1 test2    test3 test-4';
            var result = ['test1', 'test2', 'test3', 'test-4'];
            obj.parseClass(str).should.deep.equal(result);
          });

          it('Style attribute is isolated', function() {
            var str = '<div id="test1" style="color:black; width:100px; test:value;"></div>';
            var result = {
              tagName: 'div',
              attributes: { id: 'test1'},
              style: {
                color: 'black',
                width: '100px',
                test: 'value',
              }
            };
            obj.parse(str).should.deep.equal(result);
          });

          it('Class attribute is isolated', function() {
            var str = '<div id="test1" class="test2 test3 test4"></div>';
            var result = {
              tagName: 'div',
              attributes: { id: 'test1'},
              classes: ['test2', 'test3', 'test4']
            };
            obj.parse(str).should.deep.equal(result);
          });

          it.skip('Parse nested nodes', function() {

          });

          it.skip('Parse images nodes', function() {

          });

          it.skip('Parse text nodes', function() {

          });

        });

      }
    };

});