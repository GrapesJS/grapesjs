import { parseSelector } from 'parser/model/BrowserParserCss';
import ParserCss from 'parser/model/ParserCss';

describe('ParserCss', () => {
  let obj;
  let config;
  let customParser;

  beforeEach(() => {
    config = {
      em: {
        getCustomParserCss: () => customParser,
        trigger: () => {}
      }
    };
    obj = new ParserCss(config);
  });

  afterEach(() => {
    obj = null;
  });

  test('Parse selector', () => {
    var str = '.test';
    var result = [['test']];
    expect(parseSelector(str).result).toEqual(result);
  });

  test('Parse selectors', () => {
    var str = '.test1, .test1.test2, .test2.test3';
    var result = [['test1'], ['test1', 'test2'], ['test2', 'test3']];
    expect(parseSelector(str).result).toEqual(result);
  });

  test('Ignore not valid selectors', () => {
    var str = '.test1.test2, .test2 .test3, div > .test4, #test.test5, .test6';
    var result = [['test1', 'test2'], ['test6']];
    expect(parseSelector(str).result).toEqual(result);
  });

  test('Parse selectors with state', () => {
    var str = '.test1. test2, .test2>test3, .test4.test5:hover';
    var result = [['test4', 'test5:hover']];
    expect(parseSelector(str).result).toEqual(result);
  });

  test('Parse simple rule', () => {
    var str = ' .test1 {color:red; width: 50px  }';
    var result = {
      selectors: ['test1'],
      style: {
        color: 'red',
        width: '50px'
      }
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Parse rule with more selectors', () => {
    var str = ' .test1.test2 {color:red; test: value}';
    var result = {
      selectors: ['test1', 'test2'],
      style: { color: 'red', test: 'value' }
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Parse same rule with more selectors', () => {
    var str = ' .test1.test2, .test3{ color:red }';
    var result = [
      {
        selectors: ['test1', 'test2'],
        style: { color: 'red' }
      },
      {
        selectors: ['test3'],
        style: { color: 'red' }
      }
    ];
    expect(obj.parse(str)).toEqual(result);
  });

  test('Parse more rules', () => {
    var str =
      ' .test1.test2, .test3{ color:red } .test4, .test5.test6{ width:10px }';
    var result = [
      {
        selectors: ['test1', 'test2'],
        style: { color: 'red' }
      },
      {
        selectors: ['test3'],
        style: { color: 'red' }
      },
      {
        selectors: ['test4'],
        style: { width: '10px' }
      },
      {
        selectors: ['test5', 'test6'],
        style: { width: '10px' }
      }
    ];
    expect(obj.parse(str)).toEqual(result);
  });

  test('Parse rule with state', () => {
    var str = ' .test1.test2:hover{ color:red }';
    var result = {
      selectors: ['test1', 'test2'],
      style: { color: 'red' },
      state: 'hover'
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Parse rule with state like after', () => {
    var str = ' .test1.test2::after{ color:red }';
    var result = {
      selectors: ['test1', 'test2'],
      style: { color: 'red' },
      state: ':after'
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Parse rule with nth-x state', () => {
    var str = ' .test1.test2:nth-of-type(2n){ color:red }';
    var result = {
      selectors: ['test1', 'test2'],
      style: { color: 'red' },
      state: 'nth-of-type(2n)'
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  // Phantom don't find 'node.conditionText' so will skip it
  test('Parse rule inside media query', () => {
    var str =
      '@media only screen and (max-width: 992px){ .test1.test2:hover{ color:red }}';
    var result = {
      atRuleType: 'media',
      selectors: ['test1', 'test2'],
      style: { color: 'red' },
      state: 'hover',
      mediaText: 'only screen and (max-width: 992px)'
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  // Phantom don't find 'node.conditionText' so will skip it
  test('Parse rule inside media query', () => {
    var str = '@media (max-width: 992px){ .test1.test2:hover{ color:red }}';
    var result = {
      atRuleType: 'media',
      selectors: ['test1', 'test2'],
      style: { color: 'red' },
      state: 'hover',
      mediaText: '(max-width: 992px)'
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  // Phantom doesn't find 'node.conditionText' so will skip it
  test('Parse rules inside media queries', () => {
    var str =
      '.test1:hover{ color:white }@media (max-width: 992px){ .test1.test2:hover{ color:red } .test2{ color: blue }}';
    var result = [
      {
        selectors: ['test1'],
        style: { color: 'white' },
        state: 'hover'
      },
      {
        selectors: ['test1', 'test2'],
        style: { color: 'red' },
        state: 'hover',
        atRuleType: 'media',
        mediaText: '(max-width: 992px)'
      },
      {
        selectors: ['test2'],
        style: { color: 'blue' },
        atRuleType: 'media',
        mediaText: '(max-width: 992px)'
      }
    ];
    expect(obj.parse(str)).toEqual(result);
  });

  test('Parse rules with not class-based selectors', () => {
    var str = ' .class1 .class2, div > .class3 { color:red }';
    var result = {
      selectors: [],
      selectorsAdd: '.class1 .class2, div > .class3',
      style: { color: 'red' }
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Parse rule with mixed selectors', () => {
    var str =
      ' .class1 .class2, .class3, div > .class4, .class5.class6 { color:red }';
    var result = [
      {
        selectors: ['class3'],
        style: { color: 'red' }
      },
      {
        selectors: ['class5', 'class6'],
        selectorsAdd: '.class1 .class2, div > .class4',
        style: { color: 'red' }
      }
    ];
    expect(obj.parse(str)).toEqual(result);
  });

  test('Parse rule with important styles', () => {
    var str =
      ' .test1 {color:red !important; width: 100px; height: 10px !important}';
    var result = {
      selectors: ['test1'],
      style: {
        color: 'red !important',
        height: '10px !important',
        width: '100px'
      }
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Parse rule with CSS variables', () => {
    var str = `:root {
        --some-color: red;
        --some-width: 55px;
    }`;
    var result = {
      selectors: [],
      selectorsAdd: ':root',
      style: {
        '--some-color': 'red',
        '--some-width': '55px'
      }
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  // Can't test keyframes https://github.com/NV/CSSOM/issues/95
  test.skip('Parse rule with a keyframes at-rule', () => {
    var str = `@keyframes {
      from {opacity: 0;}
      to {opacity: 1;}
    }`;
    var result = [
      {
        selectors: [],
        atRuleType: 'keyframes',
        selectorsAdd: 'from',
        style: { opacity: '0' }
      },
      {
        selectors: [],
        atRuleType: 'keyframes',
        selectorsAdd: 'to',
        style: { opacity: '1' }
      }
    ];
    expect(obj.parse(str)).toEqual(result);
  });

  test('Parse rule with font-face at-rule', () => {
    var str = `@font-face {
     font-family: "Open Sans";
    }`;
    var result = {
      selectors: [],
      selectorsAdd: '',
      atRuleType: 'font-face',
      singleAtRule: 1,
      style: { 'font-family': '"Open Sans"' }
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Parses multiple font-face at-rules', () => {
    const str = `
      @font-face {
        font-family: "Open Sans";
      }
      @font-face {
        font-family: 'Glyphicons Halflings';
        src:url(https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/fonts/glyphicons-halflings-regular.eot)
      }`;
    const result = [
      {
        selectors: [],
        selectorsAdd: '',
        style: { 'font-family': '"Open Sans"' },
        singleAtRule: 1,
        atRuleType: 'font-face'
      },
      {
        selectors: [],
        selectorsAdd: '',
        style: {
          'font-family': "'Glyphicons Halflings'",
          src:
            'url(https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/fonts/glyphicons-halflings-regular.eot)'
        },
        singleAtRule: 1,
        atRuleType: 'font-face'
      }
    ];
    const parsed = obj.parse(str);
    expect(parsed).toEqual(result);
  });

  test('Parse ID rule', () => {
    var str = `#test { color: red }`;
    var result = {
      selectors: ['#test'],
      style: { color: 'red' }
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Parse ID rule with state', () => {
    var str = `#test:hover { color: red }`;
    var result = {
      selectors: ['#test'],
      state: 'hover',
      style: { color: 'red' }
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Avoid composed selectors with ID', () => {
    var str = `#test.class, #test.class:hover, .class  { color: red }`;
    var result = {
      selectors: ['class'],
      selectorsAdd: '#test.class, #test.class:hover',
      style: { color: 'red' }
    };
    expect(obj.parse(str)).toEqual([result]);
  });

  test('Parse CSS with custom parser', () => {
    var str = '.test1 { color:red }';
    var result = {
      selectors: ['test1'],
      style: { color: 'blue' }
    };
    obj = new ParserCss({
      parserCss: () => [result]
    });
    expect(obj.parse(str)).toEqual([result]);
  });

  // test.skip('Parse CSS with custom async parser', async () => {
  //   var str = '.test1 { color:red }';
  //   var result = {
  //     selectors: ['test1'],
  //     style: { color: 'blue' }
  //   };
  //   obj = new ParserCss({
  //     parserCss: async () => [result]
  //   });
  //   const cssResult = await obj.parse(str);
  //   expect(cssResult).toEqual([result]);
  // });

  test('Check node with font-face rule', () => {
    const style = {
      'font-family': '"Glyphicons Halflings"',
      src:
        'url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/fonts/glyphicons-halflings-regular.eot")'
    };
    expect(
      obj.checkNode({
        atRule: 'font-face',
        selectors: '',
        style: style
      })
    ).toEqual([
      {
        style: style,
        atRuleType: 'font-face',
        singleAtRule: 1,
        selectors: []
      }
    ]);
  });

  test('Check node with keyframes rule', () => {
    const style = { opacity: 0 };
    expect(
      obj.checkNode({
        atRule: 'keyframes',
        params: 'name',
        selectors: 'from',
        style: style
      })
    ).toEqual([
      {
        selectors: [],
        atRuleType: 'keyframes',
        selectorsAdd: 'from',
        style: style,
        mediaText: 'name'
      }
    ]);
  });

  test('Check node with media rule', () => {
    const style = { color: 'blue' };
    expect(
      obj.checkNode({
        atRule: 'media',
        params: 'screen and (min-width: 480px)',
        selectors: '.class-test.class2:hover, div > span ',
        style
      })
    ).toEqual([
      {
        atRuleType: 'media',
        selectors: ['class-test', 'class2'],
        selectorsAdd: 'div > span',
        style: style,
        state: 'hover',
        mediaText: 'screen and (min-width: 480px)'
      }
    ]);
  });

  test('Check node with a rule containing id', () => {
    const style = { border: '1px solid black !important' };
    expect(
      obj.checkNode({
        selectors: '#main:hover',
        style
      })
    ).toEqual([
      {
        selectors: ['#main'],
        state: 'hover',
        style: style
      }
    ]);
  });

  test('Check node with multiple class selectors', () => {
    const style = {
      border: '1px solid black !important',
      'background-repeat': 'repeat-y, no-repeat'
    };
    expect(
      obj.checkNode({
        selectors:
          '.class1, .class1.class2:hover, div > .test:hover, span.test2',
        style
      })
    ).toEqual([
      {
        selectors: ['class1'],
        style: style
      },
      {
        selectors: ['class1', 'class2'],
        state: 'hover',
        selectorsAdd: 'div > .test:hover, span.test2',
        style: style
      }
    ]);
  });

  test('Check node with a rule containing CSS variables', () => {
    const style = {
      '--some-color': 'red',
      '--some-width': '55px'
    };
    expect(
      obj.checkNode({
        selectors: ':root',
        style
      })
    ).toEqual([
      {
        selectors: [],
        selectorsAdd: ':root',
        style: style
      }
    ]);
  });
});
