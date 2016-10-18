var path = 'CssComposer/view/';
define([path + 'CssRuleView', 'CssComposer/model/CssRule'],
  function(CssRuleView, CssRule) {

    return {
      run : function(){
          describe('CssRuleView', function() {

            before(function () {
              this.$fixtures  = $("#fixtures");
              this.$fixture   = $('<div class="cssrule-fixture"></div>');
            });

            beforeEach(function () {
              var m = new CssRule();
              this.view = new CssRuleView({
                model: m
              });
              this.$fixture.empty().appendTo(this.$fixtures);
              this.$fixture.html(this.view.render().el);
            });

            afterEach(function () {
              this.view.model.destroy();
            });

            after(function () {
              this.$fixture.remove();
            });

            it('Object exists', function() {
              CssRuleView.should.be.exist;
            });

            it('Correct behaviour of renderSelectors with single selector', function() {
              this.view.model.get('selectors').add({name: 'test'});
              this.view.renderSelectors().should.equal('.test');
            });

            it('Correct behaviour of renderSelectors with multiple selectors', function() {
              this.view.model.get('selectors').add([{name: 'test2'}, {name: 'test1'}]);
              this.view.renderSelectors().should.equal('.test2.test1');
            });

            it('Correct behaviour of renderProperties with single property', function() {
              this.view.model.set('style', {'prop': 'value'});
              this.view.renderProperties().should.equal('prop:value;');
            });

            it('Correct behaviour of renderProperties with multiple properties', function() {
              this.view.model.set('style', {'prop2': 'value2', 'prop3': 'value3'});
              this.view.renderProperties().should.equal('prop2:value2;prop3:value3;');
            });

            it('Empty style inside', function() {
              this.$fixture.html().should.equal('<style></style>');
            });

            it('On update of style always empty as there is no selectors', function() {
              this.view.model.set('style', {'prop':'value'});
              this.$fixture.html().should.equal('<style></style>');
            });

            describe('CssRuleView with selectors', function() {

              beforeEach(function () {
                var m = new CssRule({
                  selectors: [{name:'test1'}, {name:'test2'}]
                });
                this.regView = new CssRuleView({
                  model: m
                });
                this.regView.render();
              });

              afterEach(function () {
                this.regView.model.destroy();
              });

              it('Empty with no style', function() {
                this.regView.$el.html().should.equal('');
              });

              it('Not empty on update of style', function() {
                this.regView.model.set('style', {'prop':'value'});
                this.regView.$el.html().should.equal('.test1.test2{prop:value;}');
              });

              it('State correctly rendered', function() {
                this.regView.model.set('style', {'prop':'value'});
                this.regView.model.set('state', 'hover');
                this.regView.$el.html().should.equal('.test1.test2:hover{prop:value;}');
              });

              it('State render changes on update', function() {
                this.regView.model.set('style', {'prop':'value'});
                this.regView.model.set('state', 'hover');
                this.regView.model.set('state', '');
                this.regView.$el.html().should.equal('.test1.test2{prop:value;}');
              });

              it('Render media queries', function() {
                this.regView.model.set('style', {'prop':'value'});
                this.regView.model.set('maxWidth', '999px');
                this.regView.$el.html().should.equal('@media (max-width: 999px){.test1.test2{prop:value;}}');
              });

              it('Empty on clear', function() {
                this.regView.model.set('style', {'prop':'value'});
                this.regView.model.set('style', {});
                this.regView.$el.html().should.equal('');
              });

            });

        });
      }
    };

});