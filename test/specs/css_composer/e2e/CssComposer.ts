import grapesjs, { Editor } from '../../../../src';
import { CssRuleJSON } from '../../../../src/css_composer/model/CssRule';
import { createEl } from '../../../../src/utils/dom';

describe('E2E tests', () => {
  let fixtures: Element;
  let fixture: Element;
  let cssc: Editor['Css'];
  let clsm: Editor['Selectors'];
  let domc: Editor['Components'];
  let rulesSet: CssRuleJSON[];
  let rulesSet2: CssRuleJSON[];

  beforeAll(() => {
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.firstElementChild!;
  });

  beforeEach(done => {
    const gjs = grapesjs.init({
      stylePrefix: '',
      storageManager: { autoload: false, type: 'none' },
      container: 'csscomposer-fixture',
    });
    cssc = gjs.CssComposer;
    clsm = gjs.SelectorManager;
    domc = gjs.DomComponents;
    fixture = createEl('div', { class: 'csscomposer-fixture' });
    fixtures.appendChild(fixture);
    rulesSet = [
      { selectors: [{ name: 'test1' }, { name: 'test2' }] },
      { selectors: [{ name: 'test2' }, { name: 'test3' }] },
      { selectors: [{ name: 'test3' }] },
    ];
    rulesSet2 = [
      {
        selectors: [{ name: 'test1' }, { name: 'test2' }],
        state: ':active',
      },
      { selectors: [{ name: 'test2' }, { name: 'test3' }] },
      { selectors: [{ name: 'test3' }], mediaText: '(max-width: 900px)' },
    ];
    done();
  });

  afterAll(() => {
    fixture.remove();
  });

  test('Rules are correctly imported from default property', () => {
    const gj = grapesjs.init({
      stylePrefix: '',
      storageManager: { autoload: false, type: 'none' },
      cssComposer: { rules: rulesSet as any },
      container: 'csscomposer-fixture',
    });
    const cssc = gj.editor.get('CssComposer');
    expect(cssc.getAll().length).toEqual(rulesSet.length);
    const cls = gj.editor.get('SelectorManager').getAll();
    expect(cls.length).toEqual(3);
  });

  test('New rule adds correctly the class inside selector manager', () => {
    const rules = cssc.getAll();
    rules.add({ selectors: [{ name: 'test1', private: true }] });
    const rule = clsm.getAll().at(0);
    expect(rule.get('name')).toEqual('test1');
    expect(rule.get('private')).toEqual(true);
  });

  test('New rules are correctly imported inside selector manager', () => {
    const rules = cssc.getAll();
    rulesSet.forEach(item => {
      rules.add(item);
    });
    const cls = clsm.getAll();
    expect(cls.length).toEqual(3);
    expect(cls.at(0).get('name')).toEqual('test1');
    expect(cls.at(1).get('name')).toEqual('test2');
    expect(cls.at(2).get('name')).toEqual('test3');
  });

  test('Add rules from the new component added as a string with style tag', () => {
    const comps = domc.getComponents();
    const rules = cssc.getAll();
    comps.add('<div>Test</div><style>.test{color: red} .test2{color: blue}</style>');
    expect(comps.length).toEqual(1);
    expect(rules.length).toEqual(2);
  });

  test('Add raw rule objects with addCollection', () => {
    cssc.addCollection(rulesSet);
    expect(cssc.getAll().length).toEqual(3);
    expect(clsm.getAll().length).toEqual(3);
  });

  test('Add raw rule objects twice with addCollection do not duplucate rules', () => {
    const rulesSet2Copy = JSON.parse(JSON.stringify(rulesSet2));
    const coll1 = cssc.addCollection(rulesSet2);
    const coll2 = cssc.addCollection(rulesSet2Copy);
    expect(cssc.getAll().length).toEqual(3);
    expect(clsm.getAll().length).toEqual(3);
    expect(coll1).toEqual(coll2);
  });

  test('Extend css rule style, if requested', () => {
    const style1 = { color: 'red', width: '10px' };
    const style2 = { height: '20px', width: '20px' };
    const rule1 = {
      selectors: ['test1'],
      style: style1,
    };
    const rule2 = {
      selectors: ['test1'],
      style: style2,
    };
    let ruleOut = cssc.addCollection([rule1])[0];
    // ruleOut is a Model
    ruleOut = JSON.parse(JSON.stringify(ruleOut));
    const ruleResult: CssRuleJSON = {
      selectors: ['test1'],
      style: {
        color: 'red',
        width: '10px',
      },
    };
    expect(ruleOut).toEqual(ruleResult);
    ruleOut = cssc.addCollection([rule2], { extend: 1 })[0];
    ruleOut = JSON.parse(JSON.stringify(ruleOut));
    ruleResult.style = {
      color: 'red',
      height: '20px',
      width: '20px',
    };
    expect(ruleOut).toEqual(ruleResult);
  });

  test('Do not extend with different selectorsAdd', () => {
    const style1 = { color: 'red', width: '10px' };
    const style2 = { height: '20px', width: '20px' };
    const rule1 = {
      selectors: [],
      selectorsAdd: '*',
      style: style1,
    };
    const rule2 = {
      selectors: [],
      selectorsAdd: 'p',
      style: style2,
    };
    let rule1Out = cssc.addCollection([rule1], { extend: 1 })[0];
    let rule2Out = cssc.addCollection([rule2], { extend: 1 })[0];
    rule1Out = JSON.parse(JSON.stringify(rule1Out));
    rule2Out = JSON.parse(JSON.stringify(rule2Out));
    const rule1Result = {
      selectors: [],
      selectorsAdd: '*',
      style: {
        color: 'red',
        width: '10px',
      },
    };
    const rule2Result = {
      selectors: [],
      selectorsAdd: 'p',
      style: {
        height: '20px',
        width: '20px',
      },
    };
    expect(rule1Out).toEqual(rule1Result);
    expect(rule2Out).toEqual(rule2Result);
  });

  test('Add raw rule objects with width via addCollection', () => {
    const coll1 = cssc.addCollection(rulesSet2);
    expect(coll1[2].get('mediaText')).toEqual(rulesSet2[2].mediaText);
  });
});
