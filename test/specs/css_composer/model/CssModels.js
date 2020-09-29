import CssRule from 'css_composer/model/CssRule';
import CssRules from 'css_composer/model/CssRules';
import Selectors from 'selector_manager/model/Selectors';
import Selector from 'selector_manager/model/Selector';

describe('CssRule', () => {
  let obj;

  beforeEach(() => {
    obj = new CssRule();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has selectors property', () => {
    expect(obj.has('selectors')).toEqual(true);
  });

  test('Has style property', () => {
    expect(obj.has('style')).toEqual(true);
  });

  test('Has state property', () => {
    expect(obj.has('state')).toEqual(true);
  });

  test('No default selectors', () => {
    expect(obj.get('selectors').length).toEqual(0);
  });

  test('Compare returns true with the same selectors', () => {
    var s1 = obj.get('selectors').add({ name: 'test1' });
    var s2 = obj.get('selectors').add({ name: 'test2' });
    expect(obj.compare([s1, s2])).toEqual(true);
  });

  test('Compare with different state', () => {
    var s1 = obj.get('selectors').add({ name: 'test1' });
    var s2 = obj.get('selectors').add({ name: 'test2' });
    obj.set('state', 'hover');
    expect(obj.compare([s1, s2])).toEqual(false);
    expect(obj.compare([s1, s2], 'hover')).toEqual(true);
  });

  test('Compare with different mediaText', () => {
    var s1 = obj.get('selectors').add({ name: 'test1' });
    var s2 = obj.get('selectors').add({ name: 'test2' });
    obj.set('state', 'hover');
    obj.set('mediaText', '1000');
    expect(obj.compare([s1, s2])).toEqual(false);
    expect(obj.compare([s1, s2], 'hover')).toEqual(false);
    expect(obj.compare([s2, s1], 'hover', '1000')).toEqual(true);
  });

  test('toCSS returns empty if there is no style', () => {
    var s1 = obj.get('selectors').add({ name: 'test1' });
    expect(obj.toCSS()).toEqual('');
  });

  test('toCSS returns empty if there is no selectors', () => {
    obj.setStyle({ color: 'red' });
    expect(obj.toCSS()).toEqual('');
  });

  test('toCSS returns simple CSS', () => {
    obj.get('selectors').add({ name: 'test1' });
    obj.setStyle({ color: 'red' });
    expect(obj.toCSS()).toEqual(`.test1{color:red;}`);
  });

  test('toCSS wraps correctly inside media rule', () => {
    const media = '(max-width: 768px)';
    obj.set('atRuleType', 'media');
    obj.set('mediaText', media);
    obj.get('selectors').add({ name: 'test1' });
    obj.setStyle({ color: 'red' });
    expect(obj.toCSS()).toEqual(`@media ${media}{.test1{color:red;}}`);
  });

  test('toCSS with a generic at-rule', () => {
    obj.set('atRuleType', 'supports');
    obj.get('selectors').add({ name: 'test1' });
    obj.setStyle({ 'font-family': 'Open Sans' });
    expect(obj.toCSS()).toEqual(`@supports{.test1{font-family:Open Sans;}}`);
  });

  test('toCSS with a generic single at-rule', () => {
    obj.set('atRuleType', 'font-face');
    obj.set('singleAtRule', 1);
    obj.setStyle({ 'font-family': 'Sans' });
    expect(obj.toCSS()).toEqual(`@font-face{font-family:Sans;}`);
  });

  test('toCSS with a generic at-rule and condition', () => {
    obj.set('atRuleType', 'font-face');
    obj.set('mediaText', 'some-condition');
    obj.get('selectors').add({ name: 'test1' });
    obj.setStyle({ 'font-family': 'Open Sans' });
    expect(obj.toCSS()).toEqual(
      `@font-face some-condition{.test1{font-family:Open Sans;}}`
    );
  });
});

describe('CssRules', () => {
  test('Creates collection item correctly', () => {
    var c = new CssRules();
    var m = c.add({});
    expect(m instanceof CssRule).toEqual(true);
  });
});

describe('Selectors', () => {
  test('Creates collection item correctly', () => {
    var c = new Selectors();
    var m = c.add({});
    expect(m instanceof Selector).toEqual(true);
  });
});
