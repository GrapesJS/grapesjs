var CssRuleView = require('css_composer/view/CssRuleView');
var CssRule = require('css_composer/model/CssRule');

module.exports = {
  run() {
      describe('CssRuleView', () => {

        let obj;
        let fixtures;

        beforeEach(function () {
          var m = new CssRule();
          obj = new CssRuleView({
            model: m
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.querySelector('#fixtures');
          fixtures.appendChild(obj.render().el);
        });

        afterEach(() => {
          obj.model.destroy();
        });

        it('Object exists', () => {
          expect(CssRuleView).toExist();
        });

        it('Empty style inside', function() {
          expect(fixtures.innerHTML).toEqual('<style></style>');
        });

        it('On update of style always empty as there is no selectors', function() {
          obj.model.set('style', {'prop':'value'});
          expect(fixtures.innerHTML).toEqual('<style></style>');
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
            document.body.innerHTML = '<div id="fixtures"></div>';
            fixtures = document.body.querySelector('#fixtures');
            fixtures.appendChild(objReg.el);
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
