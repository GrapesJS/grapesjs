const ParserHtml = require('parser/model/ParserHtml');
const ParserCss = require('parser/model/ParserCss');
const DomComponents = require('dom_components');

module.exports = {
  run() {

    describe('ParserHtml', () => {
      var obj;

      beforeEach(() => {
        var dom = new DomComponents();
        obj = new ParserHtml({
          textTags: ['br', 'b', 'i', 'u'],
          pStylePrefix: 'gjs-',
        });
        obj.compTypes = dom.componentTypes;
      });

      afterEach(() => {
        obj = null;
      });

      it('Simple div node', () => {
        var str = '<div></div>';
        var result = { tagName: 'div'};
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Simple article node', () => {
        var str = '<article></article>';
        var result = { tagName: 'article'};
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Node with attributes', () => {
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
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Parse style string to object', () => {
        var str = 'color:black; width:100px; test:value;';
        var result = {
          color: 'black',
          width: '100px',
          test: 'value',
        };
        expect(obj.parseStyle(str)).toEqual(result)
      });

      it('Parse style string with values containing colon to object', () => {
        var str = 'background-image:url("https://some-website.ex"); test:value;';
        var result = {
          'background-image': 'url("https://some-website.ex")',
          'test': 'value',
        };
        expect(obj.parseStyle(str)).toEqual(result)
      });


      it('Parse class string to array', () => {
        var str = 'test1 test2    test3 test-4';
        var result = ['test1', 'test2', 'test3', 'test-4'];
        expect(obj.parseClass(str)).toEqual(result)
      });

      it('Parse class string to array with special classes', () => {
        var str = 'test1 test2    test3 test-4 gjs-test';
        var result = ['test1', 'test2', 'test3', 'test-4'];
        expect(obj.parseClass(str)).toEqual(result)
      });

      it('Style attribute is isolated', () => {
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
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Class attribute is isolated', () => {
        var str = '<div id="test1" class="test2 test3 test4"></div>';
        var result = {
          tagName: 'div',
          attributes: { id: 'test1'},
          classes: ['test2', 'test3', 'test4']
        };
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Parse images nodes', () => {
        var str = '<img id="test1" src="./index.html"/>';
        var result = {
          tagName: 'img',
          type: 'image',
          attributes: {
            id: 'test1',
            src: './index.html',
          },
        };
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Parse text nodes', () => {
        var str = '<div id="test1">test2 </div>';
        var result = {
          tagName: 'div',
          attributes: { id: 'test1'},
          type: 'text',
          content: 'test2 ',
        };
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Parse text with few text tags', () => {
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
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Parse text with few text tags and nested node', () => {
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
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Parse nested nodes', () => {
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
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Parse nested text nodes', () => {
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
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Parse nested span text nodes', () => {
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
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Parse multiple nodes', () => {
        var str = '<div></div><div></div>';
        var result = [{ tagName: 'div'},{ tagName: 'div'}];
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Remove script tags', () => {
        var str = '<div><script>var test;</script></div><div></div><script>var test2;</script>';
        var result = [{ tagName: 'div'},{ tagName: 'div'}];
        expect(obj.parse(str).html).toEqual(result)
      });

      it('Isolate styles', () => {
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
        expect(res.html).toEqual(resHtml);
        expect(res.css).toEqual(resCss);
      });

      it('Parse nested div with text and spaces', () => {
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
        expect(obj.parse(str).html).toEqual(result);
      });

      it('Parse node with model attributes to fetch', () => {
        var str = '<div id="test1" data-test="test-value" data-gjs-draggable=".myselector" data-gjs-stuff="test">test2 </div>';
        var result = {
          tagName: 'div',
          draggable: '.myselector',
          stuff: 'test',
          attributes: {
            id: 'test1',
            'data-test': 'test-value'
          },
          type: 'text',
          content: 'test2 ',
        };
        expect(obj.parse(str).html).toEqual(result);
      });

      it('Parse model attributes with true and false', () => {
        var str = '<div id="test1" data-test="test-value" data-gjs-draggable="true" data-gjs-stuff="false">test2 </div>';
        var result = {
          tagName: 'div',
          draggable: true,
          stuff: false,
          attributes: {
            id: 'test1',
            'data-test': 'test-value'
          },
          type: 'text',
          content: 'test2 ',
        };
        expect(obj.parse(str).html).toEqual(result);
      });

    });

  }
};
