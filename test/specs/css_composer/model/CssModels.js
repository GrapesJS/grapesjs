var CssRule = require('css_composer/model/CssRule');
var CssRules = require('css_composer/model/CssRules');
var Selectors = require('selector_manager/model/Selectors');
var Selector = require('selector_manager/model/Selector');

module.exports = {
  run() {
      describe('CssRule', () => {
        let obj;

        beforeEach(() => {
          obj = new CssRule();
        });

        afterEach(() => {
          obj = null;
        });

        it('Has selectors property', () => {
          expect(obj.has('selectors')).toEqual(true);
        });

        it('Has style property', () => {
          expect(obj.has('style')).toEqual(true);
        });

        it('Has state property', () => {
          expect(obj.has('state')).toEqual(true);
        });

        it('No default selectors', () => {
          expect(obj.get('selectors').length).toEqual(0);
        });

        it('Compare returns true with the same selectors', () => {
          var s1 = obj.get('selectors').add({ name: 'test1' });
          var s2 = obj.get('selectors').add({ name: 'test2' });
          expect(obj.compare([s1, s2])).toEqual(true);
        });

        it('Compare with different state', () => {
          var s1 = obj.get('selectors').add({ name: 'test1' });
          var s2 = obj.get('selectors').add({ name: 'test2' });
          obj.set('state','hover');
          expect(obj.compare([s1, s2])).toEqual(false);
          expect(obj.compare([s1, s2], 'hover')).toEqual(true);
        });

        it('Compare with different mediaText', () => {
          var s1 = obj.get('selectors').add({ name: 'test1' });
          var s2 = obj.get('selectors').add({ name: 'test2' });
          obj.set('state','hover');
          obj.set('mediaText','1000');
          expect(obj.compare([s1, s2])).toEqual(false);
          expect(obj.compare([s1, s2], 'hover')).toEqual(false);
          expect(obj.compare([s2, s1], 'hover', '1000')).toEqual(true);
        });

        it('toCSS returns empty if there is no style', () => {
          var s1 = obj.get('selectors').add({ name: 'test1' });
          expect(obj.toCSS()).toEqual('');
        });

        it('toCSS returns empty if there is no selectors', () => {
          obj.setStyle({color: 'red'});
          expect(obj.toCSS()).toEqual('');
        });

        it('toCSS returns simple CSS', () => {
          obj.get('selectors').add({ name: 'test1' });
          obj.setStyle({color: 'red'});
          expect(obj.toCSS()).toEqual(`.test1{color:red;}`);
        });

        it('toCSS wraps correctly inside media rule', () => {
          const media = '(max-width: 768px)';
          obj.set('mediaText', media);
          obj.get('selectors').add({ name: 'test1' });
          obj.setStyle({color: 'red'});
          expect(obj.toCSS()).toEqual(`@media ${media}{.test1{color:red;}}`);
        });

    });

    describe('CssRules', () => {

        it('Creates collection item correctly', () => {
          var c = new CssRules();
          var m = c.add({});
          expect(m instanceof CssRule).toEqual(true);
        });

    });

     describe('Selectors', () => {

        it('Creates collection item correctly', () => {
          var c = new Selectors();
          var m = c.add({});
          expect(m instanceof Selector).toEqual(true);
        });

    });
  }
};
