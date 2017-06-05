var CssRuleView = require('css_composer/view/CssRuleView');
var CssRule = require('css_composer/model/CssRule');

module.exports = {
  run() {
      describe('CssRuleView', () => {

        let obj;

        before(function () {
          this.$fixtures  = $("#fixtures");
          this.$fixture   = $('<div class="cssrule-fixture"></div>');
        });

        beforeEach(function () {
          var m = new CssRule();
          obj = new CssRuleView({
            model: m
          });
          this.$fixture.empty().appendTo(this.$fixtures);
          this.$fixture.html(obj.render().el);
        });

        afterEach(() => {
          obj.model.destroy();
        });

        after(function () {
          this.$fixture.remove();
        });

        it('Object exists', () => {
          expect(CssRuleView).toExist();
        });

        it('Correct behaviour of renderSelectors with single selector', () => {
          obj.model.get('selectors').add({name: 'test'});
          expect(obj.renderSelectors()).toEqual('.test');
        });

        it('Correct behaviour of renderSelectors with multiple selectors', () => {
          obj.model.get('selectors').add([{name: 'test2'}, {name: 'test1'}]);
          expect(obj.renderSelectors()).toEqual('.test2.test1');
        });

        it('Correct behaviour of renderProperties with single property', () => {
          obj.model.set('style', {'prop': 'value'});
          expect(obj.renderProperties()).toEqual('prop:value;');
        });

        it('Correct behaviour of renderProperties with multiple properties', () => {
          obj.model.set('style', {'prop2': 'value2', 'prop3': 'value3'});
          expect(obj.renderProperties()).toEqual('prop2:value2;prop3:value3;');
        });

        it('Empty style inside', function() {
          expect(this.$fixture.html()).toEqual('<style></style>');
        });

        it('On update of style always empty as there is no selectors', function() {
          obj.model.set('style', {'prop':'value'});
          expect(this.$fixture.html()).toEqual('<style></style>');
        });

        describe('CssRuleView with selectors', () => {

          let objReg;

          beforeEach(() => {
            var m = new CssRule({
              selectors: [{name:'test1'}, {name:'test2'}]
            });
            objReg = new CssRuleView({
              model: m
            });
            objReg.render();
          });

          afterEach(() => {
            objReg.model.destroy();
          });

          it('Empty with no style', () => {
            expect(objReg.$el.html()).toEqual('');
          });

          it('Not empty on update of style', () => {
            objReg.model.set('style', {'prop':'value'});
            expect(objReg.$el.html()).toEqual('.test1.test2{prop:value;}');
          });

          it('State correctly rendered', () => {
            objReg.model.set('style', {'prop':'value'});
            objReg.model.set('state', 'hover');
            expect(objReg.$el.html()).toEqual('.test1.test2:hover{prop:value;}');
          });

          it('State render changes on update', () => {
            objReg.model.set('style', {'prop':'value'});
            objReg.model.set('state', 'hover');
            objReg.model.set('state', '');
            expect(objReg.$el.html()).toEqual('.test1.test2{prop:value;}');
          });

          it('Render media queries', () => {
            objReg.model.set('style', {'prop':'value'});
            objReg.model.set('mediaText', '(max-width: 999px)');
            expect(objReg.$el.html()).toEqual('@media (max-width: 999px){.test1.test2{prop:value;}}');
          });

          it('Empty on clear', () => {
            objReg.model.set('style', {'prop':'value'});
            objReg.model.set('style', {});
            expect(objReg.$el.html()).toEqual('');
          });

        });

    });
  }
};
