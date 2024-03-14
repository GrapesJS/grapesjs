import ParserHtml from '../../../../src/parser/model/ParserHtml';
import ParserCss from '../../../../src/parser/model/ParserCss';
import DomComponents from '../../../../src/dom_components';
import Editor from '../../../../src/editor/model/Editor';
import { CSS_BG_OBJ, CSS_BG_STR } from './ParserCss';

describe('ParserHtml', () => {
  let obj: ReturnType<typeof ParserHtml>;

  beforeEach(() => {
    const em = new Editor({});
    const dom = new DomComponents(em);
    obj = ParserHtml(em, {
      textTags: ['br', 'b', 'i', 'u'],
      textTypes: ['text', 'textnode', 'comment'],
      returnArray: true,
    });
    obj.compTypes = dom.componentTypes as any;
  });

  test('Simple div node', () => {
    const str = '<div></div>';
    const result = [{ tagName: 'div' }];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Simple article node', () => {
    const str = '<article></article>';
    const result = [{ tagName: 'article' }];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Node with attributes', () => {
    const str = '<div id="test1" class="test2 test3" data-one="test4" strange="test5"></div>';
    const result = [
      {
        tagName: 'div',
        classes: ['test2', 'test3'],
        attributes: {
          'data-one': 'test4',
          id: 'test1',
          strange: 'test5',
        },
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse style string to object', () => {
    const str = 'color:black; width:100px; test:value;';
    const result = {
      color: 'black',
      width: '100px',
      test: 'value',
    };
    expect(obj.parseStyle(str)).toEqual(result);
  });

  test('Parse style string with values containing colon to object', () => {
    const str = 'background-image:url("https://some-website.ex"); test:value;';
    const result = {
      'background-image': 'url("https://some-website.ex")',
      test: 'value',
    };
    expect(obj.parseStyle(str)).toEqual(result);
  });

  test('Parse style with multiple values of the same key', () => {
    expect(obj.parseStyle(CSS_BG_STR)).toEqual(CSS_BG_OBJ);
  });

  test('Parse style with comments', () => {
    expect(obj.parseStyle('/* color #ffffff; */ width: 100px;')).toEqual({
      width: '100px',
    });
  });

  test('Parse class string to array', () => {
    const str = 'test1 test2    test3 test-4';
    const result = ['test1', 'test2', 'test3', 'test-4'];
    expect(obj.parseClass(str)).toEqual(result);
  });

  test('Parse class string to array with special classes', () => {
    const str = 'test1 test2    test3 test-4 gjs-test';
    const result = ['test1', 'test2', 'test3', 'test-4', 'gjs-test'];
    expect(obj.parseClass(str)).toEqual(result);
  });

  test('Style attribute is isolated', () => {
    const str = '<div id="test1" style="color:black; width:100px; test:value;"></div>';
    const result = [
      {
        tagName: 'div',
        attributes: { id: 'test1' },
        style: {
          color: 'black',
          width: '100px',
          test: 'value',
        },
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Class attribute is isolated', () => {
    const str = '<div id="test1" class="test2 test3 test4"></div>';
    const result = [
      {
        tagName: 'div',
        attributes: { id: 'test1' },
        classes: ['test2', 'test3', 'test4'],
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse images nodes', () => {
    const str = '<img id="test1" src="./index.html"/>';
    const result = [
      {
        tagName: 'img',
        type: 'image',
        attributes: {
          id: 'test1',
          src: './index.html',
        },
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse text nodes', () => {
    const str = '<div id="test1">test2 </div>';
    const result = [
      {
        tagName: 'div',
        attributes: { id: 'test1' },
        type: 'text',
        components: { type: 'textnode', content: 'test2 ' },
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse text with few text tags', () => {
    const str = '<div id="test1"><br/> test2 <br/> a b <b>b</b> <i>i</i> <u>u</u> test </div>';
    const result = [
      {
        tagName: 'div',
        attributes: { id: 'test1' },
        type: 'text',
        components: [
          { tagName: 'br' },
          {
            content: ' test2 ',
            type: 'textnode',
            tagName: '',
          },
          { tagName: 'br' },
          {
            content: ' a b ',
            type: 'textnode',
            tagName: '',
          },
          {
            components: { type: 'textnode', content: 'b' },
            type: 'text',
            tagName: 'b',
          },
          {
            content: ' ',
            type: 'textnode',
            tagName: '',
          },
          {
            components: { type: 'textnode', content: 'i' },
            tagName: 'i',
            type: 'text',
          },
          {
            content: ' ',
            type: 'textnode',
            tagName: '',
          },
          {
            components: { type: 'textnode', content: 'u' },
            tagName: 'u',
            type: 'text',
          },
          {
            content: ' test ',
            type: 'textnode',
            tagName: '',
          },
        ],
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse text with few text tags and nested node', () => {
    const str = '<div id="test1">a b <b>b</b> <i>i</i>c <div>ABC</div> <i>i</i> <u>u</u> test </div>';
    const result = [
      {
        tagName: 'div',
        attributes: { id: 'test1' },
        type: 'text',
        components: [
          {
            content: 'a b ',
            type: 'textnode',
            tagName: '',
          },
          {
            components: { type: 'textnode', content: 'b' },
            tagName: 'b',
            type: 'text',
          },
          {
            content: ' ',
            type: 'textnode',
            tagName: '',
          },
          {
            components: { type: 'textnode', content: 'i' },
            tagName: 'i',
            type: 'text',
          },
          {
            content: 'c ',
            type: 'textnode',
            tagName: '',
          },
          {
            tagName: 'div',
            type: 'text',
            components: { type: 'textnode', content: 'ABC' },
          },
          {
            content: ' ',
            type: 'textnode',
            tagName: '',
          },
          {
            components: { type: 'textnode', content: 'i' },
            tagName: 'i',
            type: 'text',
          },
          {
            content: ' ',
            type: 'textnode',
            tagName: '',
          },
          {
            components: { type: 'textnode', content: 'u' },
            tagName: 'u',
            type: 'text',
          },
          {
            content: ' test ',
            type: 'textnode',
            tagName: '',
          },
        ],
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse text with few text tags and comment', () => {
    const str = '<div id="test1">Some text <br/><!-- comment --><b>Bold</b></div>';
    const result = [
      {
        tagName: 'div',
        attributes: { id: 'test1' },
        type: 'text',
        components: [
          {
            content: 'Some text ',
            type: 'textnode',
            tagName: '',
          },
          { tagName: 'br' },
          {
            content: ' comment ',
            type: 'comment',
            tagName: '',
          },
          {
            components: { type: 'textnode', content: 'Bold' },
            type: 'text',
            tagName: 'b',
          },
        ],
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse nested nodes', () => {
    const str =
      '<article id="test1">   <div></div> <footer id="test2"></footer>  Text mid <div id="last"></div></article>';
    const result = [
      {
        tagName: 'article',
        attributes: { id: 'test1' },
        components: [
          {
            tagName: 'div',
          },
          {
            content: ' ',
            type: 'textnode',
            tagName: '',
          },
          {
            tagName: 'footer',
            attributes: { id: 'test2' },
          },
          {
            tagName: '',
            type: 'textnode',
            content: '  Text mid ',
          },
          {
            tagName: 'div',
            attributes: { id: 'last' },
          },
        ],
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse nested text nodes', () => {
    const str = '<div>content1 <div>nested</div> content2</div>';
    const result = [
      {
        tagName: 'div',
        type: 'text',
        components: [
          {
            tagName: '',
            type: 'textnode',
            content: 'content1 ',
          },
          {
            tagName: 'div',
            type: 'text',
            components: { type: 'textnode', content: 'nested' },
          },
          {
            tagName: '',
            type: 'textnode',
            content: ' content2',
          },
        ],
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse nested span text nodes', () => {
    const str = '<div>content1 <div><span>nested</span></div> content2</div>';
    const result = [
      {
        tagName: 'div',
        components: [
          {
            tagName: '',
            type: 'textnode',
            content: 'content1 ',
          },
          {
            tagName: 'div',
            components: [
              {
                tagName: 'span',
                type: 'text',
                components: { type: 'textnode', content: 'nested' },
              },
            ],
          },
          {
            tagName: '',
            type: 'textnode',
            content: ' content2',
          },
        ],
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse multiple nodes', () => {
    const str = '<div></div><div></div>';
    const result = [{ tagName: 'div' }, { tagName: 'div' }];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Remove script tags', () => {
    const str = '<div><script>const test;</script></div><div></div><script>const test2;</script>';
    const result = [{ tagName: 'div' }, { tagName: 'div' }];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Isolate styles', () => {
    const str = '<div><style>.a{color: red}</style></div><div></div><style>.b{color: blue}</style>';
    const resHtml = [{ tagName: 'div' }, { tagName: 'div' }];
    const resCss = [
      {
        selectors: ['a'],
        style: { color: 'red' },
      },
      {
        selectors: ['b'],
        style: { color: 'blue' },
      },
    ];
    const res = obj.parse(str, ParserCss());
    expect(res.html).toEqual(resHtml);
    expect(res.css).toEqual(resCss);
  });

  test('Respect multiple font-faces contained in styles in html', () => {
    const str = `
      <style>
      @font-face {
        font-family: "Open Sans";
        src:url(https://fonts.gstatic.com/s/droidsans/v8/SlGVmQWMvZQIdix7AFxXkHNSbRYXags.woff2)
      }
      @font-face {
        font-family: 'Glyphicons Halflings';
        src:url(https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/fonts/glyphicons-halflings-regular.eot)
      }
      </style>
      <div>a div</div>
    `;

    const expected = [
      {
        selectors: [],
        selectorsAdd: '',
        style: {
          'font-family': '"Open Sans"',
          src: 'url(https://fonts.gstatic.com/s/droidsans/v8/SlGVmQWMvZQIdix7AFxXkHNSbRYXags.woff2)',
        },
        singleAtRule: true,
        atRuleType: 'font-face',
      },
      {
        selectors: [],
        selectorsAdd: '',
        style: {
          'font-family': "'Glyphicons Halflings'",
          src: 'url(https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/fonts/glyphicons-halflings-regular.eot)',
        },
        singleAtRule: true,
        atRuleType: 'font-face',
      },
    ];

    const res = obj.parse(str, ParserCss());
    expect(res.css).toEqual(expected);
  });

  test('Parse nested div with text and spaces', () => {
    const str = '<div> <p>TestText</p> </div>';
    const result = [
      {
        tagName: 'div',
        type: 'text',
        components: [
          {
            tagName: '',
            type: 'textnode',
            content: ' ',
          },
          {
            tagName: 'p',
            components: { type: 'textnode', content: 'TestText' },
            type: 'text',
          },
          {
            tagName: '',
            type: 'textnode',
            content: ' ',
          },
        ],
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse node with model attributes to fetch', () => {
    const str =
      '<div id="test1" data-test="test-value" data-gjs-draggable=".myselector" data-gjs-stuff="test">test2 </div>';
    const result = [
      {
        tagName: 'div',
        draggable: '.myselector',
        stuff: 'test',
        attributes: {
          id: 'test1',
          'data-test': 'test-value',
        },
        type: 'text',
        components: { type: 'textnode', content: 'test2 ' },
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse model attributes with true and false', () => {
    const str = '<div id="test1" data-test="test-value" data-gjs-draggable="true" data-gjs-stuff="false">test2 </div>';
    const result = [
      {
        tagName: 'div',
        draggable: true,
        stuff: false,
        attributes: {
          id: 'test1',
          'data-test': 'test-value',
        },
        type: 'text',
        components: { type: 'textnode', content: 'test2 ' },
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse attributes with object inside', () => {
    const str = '<div data-gjs-test=\'{ "prop1": "value1", "prop2": 10, "prop3": true}\'>test2 </div>';
    const result = [
      {
        tagName: 'div',
        attributes: {},
        type: 'text',
        test: {
          prop1: 'value1',
          prop2: 10,
          prop3: true,
        },
        components: { type: 'textnode', content: 'test2 ' },
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('Parse attributes with arrays inside', () => {
    const str = '<div data-gjs-test=\'["value1", "value2"]\'>test2 </div>';
    const result = [
      {
        tagName: 'div',
        attributes: {},
        type: 'text',
        test: ['value1', 'value2'],
        components: { type: 'textnode', content: 'test2 ' },
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  test('SVG is properly parsed', () => {
    const str = `<div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <linearGradient x1="0%" y1="0%"/>
        <path d="M13 12h7v1.5h-7m0-4h7V11h-7m0 3.5h7V16h-7m8-12H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 15h-9V6h9"></path>
      </svg>
    </div>`;
    const result = [
      {
        tagName: 'div',
        components: [
          {
            type: 'svg',
            tagName: 'svg',
            attributes: {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 24 24',
            },
            components: [
              {
                tagName: 'linearGradient',
                attributes: { x1: '0%', y1: '0%' },
                type: 'svg-in',
              },
              {
                tagName: 'path',
                attributes: {
                  d: 'M13 12h7v1.5h-7m0-4h7V11h-7m0 3.5h7V16h-7m8-12H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 15h-9V6h9',
                },
                type: 'svg-in',
              },
            ],
          },
        ],
      },
    ];
    expect(obj.parse(str).html).toEqual(result);
  });

  describe('Options', () => {
    test('Remove unsafe attributes', () => {
      const str = '<img src="path/img" data-test="1" class="test" onload="unsafe"/>';
      const result = {
        type: 'image',
        tagName: 'img',
        classes: ['test'],
        attributes: {
          src: 'path/img',
          'data-test': '1',
        },
      };
      expect(obj.parse(str).html).toEqual([result]);
      expect(obj.parse(str, null, { allowUnsafeAttr: true }).html).toEqual([
        {
          ...result,
          attributes: {
            ...result.attributes,
            onload: 'unsafe',
          },
        },
      ]);
    });

    test('Remove unsafe attribute values', () => {
      const str = '<iframe src="javascript:alert(1)"></iframe>';
      const result = {
        type: 'iframe',
        tagName: 'iframe',
      };
      expect(obj.parse(str).html).toEqual([result]);
      expect(obj.parse(str, null, { allowUnsafeAttrValue: true }).html).toEqual([
        {
          ...result,
          attributes: {
            src: 'javascript:alert(1)',
          },
        },
      ]);
    });

    test('Custom preParser option', () => {
      const str = '<iframe src="javascript:alert(1)"></iframe>';
      const result = {
        type: 'iframe',
        tagName: 'iframe',
        attributes: {
          src: 'test:alert(1)',
        },
      };
      const preParser = (str: string) => str.replace('javascript:', 'test:');
      expect(obj.parse(str, null, { preParser }).html).toEqual([result]);
    });
  });
});
