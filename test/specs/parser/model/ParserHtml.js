var path = 'Parser/';
define([path + 'model/ParserHtml', path + 'model/ParserCss', 'DomComponents'],
  function(ParserHtml, ParserCss, DomComponents) {

    return {
      run : function(){

        describe('ParserHtml', function() {
          var obj;

          beforeEach(function () {
            var dom = new DomComponents();
            obj = new ParserHtml({
              textTags: ['br', 'b', 'i', 'u'],
              pStylePrefix: 'gjs-',
            });
            obj.compTypes = dom.componentTypes;
          });

          afterEach(function () {
            delete obj;
          });

          it('Simple div node', function() {
            var str = '<div></div>';
            var result = { tagName: 'div'};
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Simple article node', function() {
            var str = '<article></article>';
            var result = { tagName: 'article'};
            obj.parse(str).html.should.deep.equal(result);
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
            obj.parse(str).html.should.deep.equal(result);
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

          it('Parse class string to array with special classes', function() {
            var str = 'test1 test2    test3 test-4 gjs-test';
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
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Class attribute is isolated', function() {
            var str = '<div id="test1" class="test2 test3 test4"></div>';
            var result = {
              tagName: 'div',
              attributes: { id: 'test1'},
              classes: ['test2', 'test3', 'test4']
            };
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Parse images nodes', function() {
            var str = '<img id="test1" src="./index.html"/>';
            var result = {
              tagName: 'img',
              type: 'image',
              attributes: {
                id: 'test1',
                src: './index.html',
              },
            };
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Parse text nodes', function() {
            var str = '<div id="test1">test2 </div>';
            var result = {
              tagName: 'div',
              attributes: { id: 'test1'},
              type: 'text',
              content: 'test2 ',
            };
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Parse text with few text tags', function() {
            var str = '<div id="test1"><br/> test2 <br/> a b <b>b</b> <i>i</i> <u>u</u> test </div>';
            var result = {
              tagName: 'div',
              attributes: { id: 'test1'},
              type: 'text',
              components: [
                {tagName: 'br'},
                {
                  content: ' test2 ',
                  type: 'textnode',
                  tagName: ''
                },
                {tagName: 'br'},
                {
                  content: ' a b ',
                  type: 'textnode',
                  tagName: ''
                },{
                  content: 'b',
                  type: 'text',
                  tagName: 'b'
                },{
                  content: ' ',
                  type: 'textnode',
                  tagName: ''
                },{
                  content: 'i',
                  tagName: 'i',
                  type: 'text'
                },{
                  content: ' ',
                  type: 'textnode',
                  tagName: ''
                },{
                  content: 'u',
                  tagName: 'u',
                  type: 'text'
                },{
                  content: ' test ',
                  type: 'textnode',
                  tagName: ''
                }
              ],
            };
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Parse text with few text tags and nested node', function() {
            var str = '<div id="test1">a b <b>b</b> <i>i</i>c <div>ABC</div> <i>i</i> <u>u</u> test </div>';
            var result = {
              tagName: 'div',
              attributes: { id: 'test1'},
              type: 'text',
              components: [{
                content: 'a b ',
                type: 'textnode',
                tagName: ''
              },{
                content: 'b',
                tagName: 'b',
                type: 'text'
              },{
                content: ' ',
                type: 'textnode',
                tagName: ''
              },{
                content: 'i',
                tagName: 'i',
                type: 'text'
              },{
                content: 'c ',
                type: 'textnode',
                tagName: ''
              },{
                tagName: 'div',
                type: 'text',
                content: 'ABC',
              },{
                content: ' ',
                type: 'textnode',
                tagName: ''
              },{
                content: 'i',
                tagName: 'i',
                type: 'text'
              },{
                content: ' ',
                type: 'textnode',
                tagName: ''
              },{
                content: 'u',
                tagName: 'u',
                type: 'text'
              },{
                content: ' test ',
                type: 'textnode',
                tagName: ''
              }],
            };
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Parse nested nodes', function() {
            var str = '<article id="test1">   <div></div> <footer id="test2"></footer>  Text mid <div id="last"></div></article>';
            var result = {
              tagName: 'article',
              attributes: {id: 'test1'},
              components: [{
                  tagName: 'div'
                },{
                  content: ' ',
                  type: 'textnode',
                  tagName: ''
                },{
                  tagName: 'footer',
                  attributes: { id: 'test2'},
                },{
                  tagName: '',
                  type: 'textnode',
                  content: '  Text mid ',
                },{
                  tagName: 'div',
                  attributes: { id: 'last'},
                },
              ]
            };
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Parse nested text nodes', function() {
            var str = '<div>content1 <div>nested</div> content2</div>';
            var result = {
              tagName: 'div',
              type: 'text',
              components: [{
                tagName: '',
                type: 'textnode',
                content: 'content1 ',
              },{
                tagName: 'div',
                type: 'text',
                content: 'nested',
              },{
                tagName: '',
                type: 'textnode',
                content: ' content2',
              }],
            };
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Parse nested span text nodes', function() {
            var str = '<div>content1 <div><span>nested</span></div> content2</div>';
            var result = {
              tagName: 'div',
              type: 'text',
              components: [{
                tagName: '',
                type: 'textnode',
                content: 'content1 ',
              },{
                tagName: 'div',
                type: 'text',
                content: 'nested',
              },{
                tagName: '',
                type: 'textnode',
                content: ' content2',
              }],
            };
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Parse multiple nodes', function() {
            var str = '<div></div><div></div>';
            var result = [{ tagName: 'div'},{ tagName: 'div'}];
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Remove script tags', function() {
            var str = '<div><script>var test;</script></div><div></div><script>var test2;</script>';
            var result = [{ tagName: 'div'},{ tagName: 'div'}];
            obj.parse(str).html.should.deep.equal(result);
          });

          it('Isolate styles', function() {
            var str = '<div><style>.a{color: red}</style></div><div></div><style>.b{color: blue}</style>';
            var resHtml = [{ tagName: 'div'},{ tagName: 'div'}];
            var resCss = [{
              selectors: ['a'],
              style: { color: 'red'}
            },{
              selectors: ['b'],
              style: { color: 'blue'}
            }]
            var res = obj.parse(str, new ParserCss());
            res.html.should.deep.equal(resHtml);
            res.css.should.deep.equal(resCss);
          });

          it('Parse nested div with text and spaces', function() {
            var str = '<div> <p>TestText</p> </div>';
            var result = {
              tagName: 'div',
              type: 'text',
              components: [{
                tagName: '',
                type: 'textnode',
                content: ' ',
              },{
                tagName: 'p',
                content: 'TestText',
                type: 'text',
              },{
                tagName: '',
                type: 'textnode',
                content: ' ',
              }],
            };
            obj.parse(str).html.should.deep.equal(result);
          });

        });

      }
    };

});
