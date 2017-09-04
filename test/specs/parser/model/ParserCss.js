const ParserCss = require('parser/model/ParserCss');

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

      it('Parse selector', () => {
        var str = '.test';
        var result = [['test']];
        expect(obj.parseSelector(str).result).toEqual(result)
      });

      it('Parse selectors', () => {
        var str = '.test1, .test1.test2, .test2.test3';
        var result = [['test1'], ['test1', 'test2'], ['test2', 'test3']];
        expect(obj.parseSelector(str).result).toEqual(result)
      });

      it('Ignore not valid selectors', () => {
        var str = '.test1.test2, .test2 .test3, div > .test4, #test.test5, .test6';
        var result = [['test1', 'test2'], ['test6']];
        expect(obj.parseSelector(str).result).toEqual(result)
      });

      it('Parse selectors with state', () => {
        var str = '.test1. test2, .test2>test3, .test4.test5:hover';
        var result = [['test4', 'test5:hover']];
        expect(obj.parseSelector(str).result).toEqual(result)
      });

      it('Parse simple rule', () => {
        var str = ' .test1 {color:red; width: 50px  }';
        var result = {
          selectors: ['test1'],
          style: {
            color: 'red',
            width: '50px',
          }
        };
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse rule with more selectors', () => {
        var str = ' .test1.test2 {color:red; test: value}';
        var result = {
          selectors: ['test1', 'test2'],
          style: {color: 'red', test: 'value'}
        };
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse same rule with more selectors', () => {
        var str = ' .test1.test2, .test3{ color:red }';
        var result = [{
          selectors: ['test1', 'test2'],
          style: { color: 'red'}
        },{
          selectors: ['test3'],
          style: { color: 'red'}
        }];
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse more rules', () => {
        var str = ' .test1.test2, .test3{ color:red } .test4, .test5.test6{ width:10px }';
        var result = [{
          selectors: ['test1', 'test2'],
          style: { color: 'red'}
        },{
          selectors: ['test3'],
          style: { color: 'red'}
        },{
          selectors: ['test4'],
          style: { width: '10px'}
        },{
          selectors: ['test5', 'test6'],
          style: { width: '10px'}
        }];
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse rule with state', () => {
        var str = ' .test1.test2:hover{ color:red }';
        var result = {
          selectors: ['test1', 'test2'],
          style: { color: 'red'},
          state: 'hover'
        };
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse rule with state like after', () => {
        var str = ' .test1.test2::after{ color:red }';
        var result = {
          selectors: ['test1', 'test2'],
          style: { color: 'red'},
          state: ':after'
        };
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse rule with nth-x state', () => {
        var str = ' .test1.test2:nth-of-type(2n){ color:red }';
        var result = {
          selectors: ['test1', 'test2'],
          style: { color: 'red'},
          state: 'nth-of-type(2n)'
        };
        expect(obj.parse(str)).toEqual(result)
      });

      // Phantom don't find 'node.conditionText' so will skip it
      it('Parse rule inside media query', () => {
        var str = '@media only screen and (max-width: 992px){ .test1.test2:hover{ color:red }}';
        var result = {
          selectors: ['test1', 'test2'],
          style: { color: 'red'},
          state: 'hover',
          mediaText: 'only screen and (max-width: 992px)',
        };
        expect(obj.parse(str)).toEqual(result)
      });

      // Phantom don't find 'node.conditionText' so will skip it
      it('Parse rule inside media query', () => {
        var str = '@media (max-width: 992px){ .test1.test2:hover{ color:red }}';
        var result = {
          selectors: ['test1', 'test2'],
          style: { color: 'red'},
          state: 'hover',
          mediaText: '(max-width: 992px)',
        };
        expect(obj.parse(str)).toEqual(result)
      });

      // Phantom doesn't find 'node.conditionText' so will skip it
      it('Parse rules inside media queries', () => {
        var str = '.test1:hover{ color:white }@media (max-width: 992px){ .test1.test2:hover{ color:red } .test2{ color: blue }}';
        var result = [{
          selectors: ['test1'],
          style: { color: 'white'},
          state: 'hover',
        },{
          selectors: ['test1', 'test2'],
          style: { color: 'red'},
          state: 'hover',
          mediaText: '(max-width: 992px)',
        },{
          selectors: ['test2'],
          style: { color: 'blue'},
          mediaText: '(max-width: 992px)',
        }];
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse rules with not class-based selectors', () => {
        var str = ' .class1 .class2, div > .class3 { color:red }';
        var result = {
          selectors: [],
          selectorsAdd: '.class1 .class2, div > .class3',
          style: { color: 'red'}
        };
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse rule with mixed selectors', () => {
        var str = ' .class1 .class2, .class3, div > .class4, .class5.class6 { color:red }';
        var result = [{
          selectors: ['class3'],
          style: { color: 'red'}
        },{
          selectors: ['class5', 'class6'],
          selectorsAdd: '.class1 .class2, div > .class4',
          style: { color: 'red'}
        }];
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse rule with important styles', () => {
        var str = ' .test1 {color:red !important; width: 100px; height: 10px !important}';
        var result = {
          selectors: ['test1'],
          style: {
            color: 'red !important',
            height: '10px !important',
            width: '100px',
          }
        };
        expect(obj.parse(str)).toEqual(result)
      });

      it('Parse rule with CSS variables', () => {
        var str = `:root {
            --some-color: red;
            --some-width: 55px;
        }`;
        var result = {
          selectors: [],
          selectorsAdd: ':root',
          style: {
            '--some-color': 'red',
            '--some-width': '55px',
          }
        };
        expect(obj.parse(str)).toEqual(result)
      });

    });

  }
};
