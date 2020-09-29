import CssGenerator from 'code_manager/model/CssGenerator';
import HtmlGenerator from 'code_manager/model/HtmlGenerator';
import DomComponents from 'dom_components';
import Component from 'dom_components/model/Component';
import Editor from 'editor/model/Editor';
import CssComposer from 'css_composer';

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
    em.get('SelectorManager').setState(state);
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
    em.get('SelectorManager').setState(state);
    comp.setStyle({ color: 'red' });
    const id = comp.getId();
    const result = `#${id}{color:blue;}#${id}:${state}{color:red;}`;
    expect(obj.build(comp, { cssc: cc, em })).toEqual(result);
  });

  test('Media queries are correctly cleaned for the length', () => {
    [
      ['@media (max-width: 999px)', 999],
      ['@media (min-width: 123%)', 123],
      ['@media (min-width: 1040rem)', 1040]
    ].forEach(item => {
      expect(obj.getQueryLength(item[0])).toBe(item[1]);
    });
  });

  test('The media objects are correctly sorted', () => {
    expect(
      obj.sortMediaObject({
        '@media (max-width: 480px)': 1,
        '@font-face': 2,
        '@media (max-width: 768px)': 3,
        '@media (max-width: 1020ch)': 4,
        '@media (max-width: 10%)': 5
      })
    ).toEqual([
      { key: '@font-face', value: 2 },
      { key: '@media (max-width: 1020ch)', value: 4 },
      { key: '@media (max-width: 768px)', value: 3 },
      { key: '@media (max-width: 480px)', value: 1 },
      { key: '@media (max-width: 10%)', value: 5 }
    ]);
  });

  test('The media objects, for the mobile first approach, are correctly sorted', () => {
    expect(
      obj.sortMediaObject({
        '@media (min-width: 480px)': 1,
        '@font-face': 2,
        '@media (min-width: 768px)': 3,
        '@media (min-width: 1020ch)': 4,
        '@media (min-width: 10%)': 5
      })
    ).toEqual([
      { key: '@font-face', value: 2 },
      { key: '@media (min-width: 10%)', value: 5 },
      { key: '@media (min-width: 480px)', value: 1 },
      { key: '@media (min-width: 768px)', value: 3 },
      { key: '@media (min-width: 1020ch)', value: 4 }
    ]);
  });
});
