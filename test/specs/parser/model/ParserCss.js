const ParserCss = require('parser/model/ParserCss');
const Selector = require('selector_manager/model/Selector');

module.exports = {
  run() {
    describe('ParserCss', () => {
      var obj;

      beforeEach(() => {
        obj = new ParserCss();
      });

      afterEach(() => {
        obj = null;
      });

      test('Parse selector', () => {
        var str = '.test';
        var result = [['test']];
        expect(obj.parseSelector(str).result).toEqual(result);
      });

      test('Parse selectors', () => {
        var str = '.test1, .test1.test2, .test2.test3';
        var result = [['test1'], ['test1', 'test2'], ['test2', 'test3']];
        expect(obj.parseSelector(str).result).toEqual(result);
      });

      test('Ignore not valid selectors', () => {
        var str =
          '.test1.test2, .test2 .test3, div > .test4, #test.test5, .test6';
        var result = [['test1', 'test2'], ['test6']];
        expect(obj.parseSelector(str).result).toEqual(result);
      });

      test('Parse selectors with state', () => {
        var str = '.test1. test2, .test2>test3, .test4.test5:hover';
        var result = [['test4', 'test5:hover']];
        expect(obj.parseSelector(str).result).toEqual(result);
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
        expect(obj.parse(str)).toEqual(result);
      });

      test('Parse rule with more selectors', () => {
        var str = ' .test1.test2 {color:red; test: value}';
        var result = {
          selectors: ['test1', 'test2'],
          style: { color: 'red', test: 'value' }
        };
        expect(obj.parse(str)).toEqual(result);
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
        expect(obj.parse(str)).toEqual(result);
      });

      test('Parse rule with state like after', () => {
        var str = ' .test1.test2::after{ color:red }';
        var result = {
          selectors: ['test1', 'test2'],
          style: { color: 'red' },
          state: ':after'
        };
        expect(obj.parse(str)).toEqual(result);
      });

      test('Parse rule with nth-x state', () => {
        var str = ' .test1.test2:nth-of-type(2n){ color:red }';
        var result = {
          selectors: ['test1', 'test2'],
          style: { color: 'red' },
          state: 'nth-of-type(2n)'
        };
        expect(obj.parse(str)).toEqual(result);
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
        expect(obj.parse(str)).toEqual(result);
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
        expect(obj.parse(str)).toEqual(result);
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
        expect(obj.parse(str)).toEqual(result);
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
        expect(obj.parse(str)).toEqual(result);
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
        expect(obj.parse(str)).toEqual(result);
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
        expect(obj.parse(str)).toEqual(result);
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
        expect(obj.parse(str)).toEqual(result);
      });

      test('Parse ID rule with state', () => {
        var str = `#test:hover { color: red }`;
        var result = {
          selectors: ['#test'],
          state: 'hover',
          style: { color: 'red' }
        };
        expect(obj.parse(str)).toEqual(result);
      });

      test('Avoid composed selectors with ID', () => {
        var str = `#test.class, #test.class:hover, .class  { color: red }`;
        var result = {
          selectors: ['class'],
          selectorsAdd: '#test.class, #test.class:hover',
          style: { color: 'red' }
        };
        expect(obj.parse(str)).toEqual(result);
      });
    });
  }
};
