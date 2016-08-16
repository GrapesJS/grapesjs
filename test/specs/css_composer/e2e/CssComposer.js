
define(['GrapesJS'],function(Grapes) {

    return {
      run : function(){
          describe('E2E tests', function() {

            before(function () {
              this.$fixtures  = $("#fixtures");
              this.$fixture   = $('<div id="csscomposer-fixture"></div>');
            });

            beforeEach(function () {
              Grapes = Grapes;
              this.gjs = Grapes.init({
                stylePrefix: '',
                storage: { autoload: 0, type:'none' },
                assetManager: { storageType: 'none', },
                container: 'csscomposer-fixture',
              });
              this.cssc = this.gjs.editor.get('CssComposer');
              this.clsm = this.gjs.editor.get('SelectorManager');
              this.domc = this.gjs.editor.Components;
              this.$fixture.empty().appendTo(this.$fixtures);
              this.gjs.render();
              this.rulesSet = [
                { selectors: [{name: 'test1'}, {name: 'test2'}] },
                { selectors: [{name: 'test2'}, {name: 'test3'}] },
                { selectors: [{name: 'test3'}] }
              ];
            });

            afterEach(function () {
              delete Grapes;
              delete this.gjs;
              delete this.cssc;
              delete this.clsm;
            });

            after(function () {
              this.$fixture.remove();
            });

            it('Rules are correctly imported from default property', function() {
              var gj = new Grapes.init({
                stylePrefix: '',
                storage: { autoload: 0, type:'none' },
                assetManager: { storageType: 'none', },
                cssComposer: { defaults: this.rulesSet},
                container: 'csscomposer-fixture',
              });
              var cssc = gj.editor.get('CssComposer');
              cssc.getRules().length.should.equal(this.rulesSet.length);
              var cls = gj.editor.get('SelectorManager').getAll();
              cls.length.should.equal(3);
            });


            it('New rule adds correctly the class inside selector manager', function() {
              var rules = this.cssc.getRules();
              rules.add({ selectors: [{name: 'test1'}] });
              this.clsm.getAll().at(0).get('name').should.equal('test1');
            });

            it('New rules are correctly imported inside selector manager', function() {
              var rules = this.cssc.getRules();
              this.rulesSet.forEach(function(item){
                rules.add(item);
              });
              var cls = this.clsm.getAll();
              cls.length.should.equal(3);
              cls.at(0).get('name').should.equal('test1');
              cls.at(1).get('name').should.equal('test2');
              cls.at(2).get('name').should.equal('test3');
            });

            it('Add rules from the new component added as a string with style tag', function() {
              var comps = this.domc.getComponents();
              var rules = this.cssc.getRules();
              comps.add("<div>Test</div><style>.test{color: red} .test2{color: blue}</style>");
              comps.length.should.equal(1);
              rules.length.should.equal(2);
            });

        });
      }
    };

});