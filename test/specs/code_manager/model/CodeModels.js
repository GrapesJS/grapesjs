const CssGenerator = require('code_manager/model/CssGenerator');
const HtmlGenerator = require('code_manager/model/HtmlGenerator');
const DomComponents = require('dom_components');
const Component = require('dom_components/model/Component');
const Editor = require('editor/model/Editor');
const CssComposer = require('css_composer');

module.exports = {
  run() {
    let comp;
    let dcomp;
    let obj;
    let em;
    let cc;

    describe('HtmlGenerator', () => {
      beforeEach(() => {
        em = new Editor();
        obj = new HtmlGenerator();
        dcomp = new DomComponents();
        comp = new Component(
          {},
          {
            em,
            componentTypes: dcomp.componentTypes
          }
        );
      });

      afterEach(() => {
        obj = null;
      });

      test('Build correctly one component', () => {
        expect(obj.build(comp)).toEqual('');
      });

      test('Build correctly empty component inside', () => {
        var m1 = comp.get('components').add({});
        expect(obj.build(comp)).toEqual('<div></div>');
      });

      test('Build correctly not empty component inside', () => {
        var m1 = comp.get('components').add({
          tagName: 'article',
          attributes: {
            'data-test1': 'value1',
            'data-test2': 'value2'
          }
        });
        expect(obj.build(comp)).toEqual(
          '<article data-test1="value1" data-test2="value2"></article>'
        );
      });

      test('Build correctly component with classes', () => {
        var m1 = comp.get('components').add({
          tagName: 'article',
          attributes: {
            'data-test1': 'value1',
            'data-test2': 'value2'
          }
        });
        ['class1', 'class2'].forEach(item => {
          m1.get('classes').add({ name: item });
        });
        expect(obj.build(comp)).toEqual(
          '<article data-test1="value1" data-test2="value2" class="class1 class2"></article>'
        );
      });
    });

    describe('CssGenerator', () => {
      let newCssComp;

      beforeEach(() => {
        em = new Editor({});
        newCssComp = () => new CssComposer().init({ em });

        cc = em.get('CssComposer');
        obj = new CssGenerator();
        dcomp = new DomComponents();
        comp = new Component(
          {},
          {
            em,
            componentTypes: dcomp.componentTypes
          }
        );
      });

      afterEach(() => {
        obj = null;
      });

      test('Build correctly one component', () => {
        expect(obj.build(comp)).toEqual('');
      });

      test('Build correctly empty component inside', () => {
        var m1 = comp.get('components').add({ tagName: 'article' });
        expect(obj.build(comp)).toEqual('');
      });

      test('Build correctly component with style inside', () => {
        var m1 = comp.get('components').add({
          tagName: 'article',
          style: {
            prop1: 'value1',
            prop2: 'value2'
          }
        });
        expect(obj.build(comp)).toEqual(
          '#' + m1.getId() + '{prop1:value1;prop2:value2;}'
        );
      });

      test('Build correctly component with class styled', () => {
        var m1 = comp.get('components').add({ tagName: 'article' });
        var cls1 = m1.get('classes').add({ name: 'class1' });

        var cssc = newCssComp();
        var rule = cssc.add(cls1);
        rule.set('style', { prop1: 'value1', prop2: 'value2' });

        expect(obj.build(comp, { cssc })).toEqual(
          '.class1{prop1:value1;prop2:value2;}'
        );
      });

      test('Build correctly component styled with class and state', () => {
        var m1 = comp.get('components').add({ tagName: 'article' });
        var cls1 = m1.get('classes').add({ name: 'class1' });

        var cssc = newCssComp();
        var rule = cssc.add(cls1);
        rule.set('style', { prop1: 'value1', prop2: 'value2' });
        rule.set('state', 'hover');

        expect(obj.build(comp, { cssc })).toEqual(
          '.class1:hover{prop1:value1;prop2:value2;}'
        );
      });

      test('Build correctly with more classes', () => {
        var m1 = comp.get('components').add({ tagName: 'article' });
        var cls1 = m1.get('classes').add({ name: 'class1' });
        var cls2 = m1.get('classes').add({ name: 'class2' });

        var cssc = newCssComp();
        var rule = cssc.add([cls1, cls2]);
        rule.set('style', { prop1: 'value1', prop2: 'value2' });

        expect(obj.build(comp, { cssc })).toEqual(
          '.class1.class2{prop1:value1;prop2:value2;}'
        );
      });

      test('Build rules with mixed classes', () => {
        var m1 = comp.get('components').add({ tagName: 'article' });
        var cls1 = m1.get('classes').add({ name: 'class1' });
        var cls2 = m1.get('classes').add({ name: 'class2' });

        var cssc = newCssComp();
        var rule = cssc.add([cls1, cls2]);
        rule.set('style', { prop1: 'value1', prop2: 'value2' });
        rule.set('selectorsAdd', '.class1 .class2, div > .class4');

        expect(obj.build(comp, { cssc })).toEqual(
          '.class1.class2, .class1 .class2, div > .class4{prop1:value1;prop2:value2;}'
        );
      });

      test('Build rules with only not class based selectors', () => {
        var cssc = newCssComp();
        var rule = cssc.add([]);
        rule.set('style', { prop1: 'value1', prop2: 'value2' });
        rule.set('selectorsAdd', '.class1 .class2, div > .class4');

        expect(obj.build(comp, { cssc })).toEqual(
          '.class1 .class2, div > .class4{prop1:value1;prop2:value2;}'
        );
      });

      test('Build correctly with class styled out', () => {
        var m1 = comp.get('components').add({ tagName: 'article' });
        var cls1 = m1.get('classes').add({ name: 'class1' });
        var cls2 = m1.get('classes').add({ name: 'class2' });

        var cssc = newCssComp();
        var rule = cssc.add([cls1, cls2]);
        rule.set('style', { prop1: 'value1' });
        var rule2 = cssc.add(cls2);
        rule2.set('style', { prop2: 'value2' });

        expect(obj.build(comp, { cssc })).toEqual(
          '.class1.class2{prop1:value1;}.class2{prop2:value2;}'
        );
      });

      test('Rule with media query', () => {
        var m1 = comp.get('components').add({ tagName: 'article' });
        var cls1 = m1.get('classes').add({ name: 'class1' });
        var cls2 = m1.get('classes').add({ name: 'class2' });

        var cssc = newCssComp();
        var rule = cssc.add([cls1, cls2]);
        rule.set('style', { prop1: 'value1' });
        rule.set('mediaText', '(max-width: 999px)');

        expect(obj.build(comp, { cssc })).toEqual(
          '@media (max-width: 999px){.class1.class2{prop1:value1;}}'
        );
      });

      test('Rules mixed with media queries', () => {
        var m1 = comp.get('components').add({ tagName: 'article' });
        var cls1 = m1.get('classes').add({ name: 'class1' });
        var cls2 = m1.get('classes').add({ name: 'class2' });

        var cssc = newCssComp();

        var rule = cssc.add([cls1, cls2]);
        rule.set('style', { prop1: 'value1' });
        var rule2 = cssc.add(cls2);
        rule2.set('style', { prop2: 'value2' });

        var rule3 = cssc.add(cls1, '', '(max-width: 999px)');
        rule3.set('style', { prop3: 'value3' });
        var rule4 = cssc.add(cls2, '', '(max-width: 999px)');
        rule4.set('style', { prop4: 'value4' });

        var rule5 = cssc.add(cls1, '', '(max-width: 100px)');
        rule5.set('style', { prop5: 'value5' });

        expect(obj.build(comp, { cssc })).toEqual(
          '.class1.class2{prop1:value1;}.class2{prop2:value2;}' +
            '@media (max-width: 999px){.class1{prop3:value3;}.class2{prop4:value4;}}' +
            '@media (max-width: 100px){.class1{prop5:value5;}}'
        );
      });

      test('Avoid useless code', () => {
        var m1 = comp.get('components').add({ tagName: 'article' });
        var cls1 = m1.get('classes').add({ name: 'class1' });

        var cssc = newCssComp();
        var rule = cssc.add(cls1);
        rule.set('style', { prop1: 'value1', prop2: 'value2' });

        comp.get('components').remove(m1);
        expect(obj.build(comp, { cssc })).toEqual('');
      });

      test('Render correctly a rule without avoidInlineStyle option', () => {
        comp.setStyle({ color: 'red' });
        const id = comp.getId();
        const result = `#${id}{color:red;}`;
        expect(obj.build(comp, { cssc: cc })).toEqual(result);
      });

      test('Render correctly a rule with avoidInlineStyle option', () => {
        em.getConfig().avoidInlineStyle = 1;
        comp = new Component(
          {},
          {
            em,
            componentTypes: dcomp.componentTypes
          }
        );
        comp.setStyle({ color: 'red' });
        const id = comp.getId();
        const result = `#${id}{color:red;}`;
        expect(obj.build(comp, { cssc: cc, em })).toEqual(result);
      });

      test('Render correctly a rule with avoidInlineStyle and state', () => {
        em.getConfig().avoidInlineStyle = 1;
        const state = 'hover';
        comp.config.avoidInlineStyle = 1;
        comp.set('state', state);
        comp.setStyle({ color: 'red' });
        const id = comp.getId();
        const result = `#${id}:${state}{color:red;}`;
        expect(obj.build(comp, { cssc: cc, em })).toEqual(result);
      });

      test('Render correctly a rule with avoidInlineStyle and w/o state', () => {
        em.getConfig().avoidInlineStyle = 1;
        const state = 'hover';
        comp.config.avoidInlineStyle = 1;
        comp.setStyle({ color: 'blue' });
        comp.set('state', state);
        comp.setStyle({ color: 'red' });
        const id = comp.getId();
        const result = `#${id}{color:blue;}#${id}:${state}{color:red;}`;
        expect(obj.build(comp, { cssc: cc, em })).toEqual(result);
      });
    });
  }
};
