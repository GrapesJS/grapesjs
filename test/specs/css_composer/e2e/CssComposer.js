
define(['GrapesJS'],function(GrapesJS) {

    return {
      run : function(){
          describe('E2E tests', function() {

            var fixtures;
            var fixture;
            var grapesjs;
            var gjs;
            var cssc, clsm, domc;
            var rulesSet;
            var rulesSet2;

            before(function () {
              fixtures = $("#fixtures");
              fixture = $('<div class="csscomposer-fixture"></div>');
            });

            beforeEach(function () {
              grapesjs = GrapesJS;
              gjs = grapesjs.init({
                stylePrefix: '',
                storageManager: { autoload: 0, type:'none' },
                assetManager: { storageType: 'none', },
                container: 'csscomposer-fixture',
              });
              cssc = gjs.CssComposer;
              clsm = gjs.SelectorManager;
              domc = gjs.DomComponents;
              fixture.empty().appendTo(fixtures);
              gjs.render();
              rulesSet = [
                { selectors: [{name: 'test1'}, {name: 'test2'}] },
                { selectors: [{name: 'test2'}, {name: 'test3'}] },
                { selectors: [{name: 'test3'}] }
              ];
              rulesSet2 = [
                { selectors: [{name: 'test1'}, {name: 'test2'}], state:':active' },
                { selectors: [{name: 'test2'}, {name: 'test3'}] },
                { selectors: [{name: 'test3'}], maxWidth:'900px' }
              ];
            });

            afterEach(function () {
              delete grapesjs;
              delete gjs;
              delete cssc;
              delete clsm;
            });

            after(function () {
              fixture.remove();
            });

            it('Rules are correctly imported from default property', function() {
              var gj = new grapesjs.init({
                stylePrefix: '',
                storageManager: { autoload: 0, type:'none' },
                assetManager: { storageType: 'none', },
                cssComposer: { rules: rulesSet},
                container: 'csscomposer-fixture',
              });
              var cssc = gj.editor.get('CssComposer');
              cssc.getAll().length.should.equal(rulesSet.length);
              var cls = gj.editor.get('SelectorManager').getAll();
              cls.length.should.equal(3);
            });


            it('New rule adds correctly the class inside selector manager', function() {
              var rules = cssc.getAll();
              rules.add({ selectors: [{name: 'test1'}] });
              clsm.getAll().at(0).get('name').should.equal('test1');
            });

            it('New rules are correctly imported inside selector manager', function() {
              var rules = cssc.getAll();
              rulesSet.forEach(function(item){
                rules.add(item);
              });
              var cls = clsm.getAll();
              cls.length.should.equal(3);
              cls.at(0).get('name').should.equal('test1');
              cls.at(1).get('name').should.equal('test2');
              cls.at(2).get('name').should.equal('test3');
            });

            it('Add rules from the new component added as a string with style tag', function() {
              var comps = domc.getComponents();
              var rules = cssc.getAll();
              comps.add("<div>Test</div><style>.test{color: red} .test2{color: blue}</style>");
              comps.length.should.equal(1);
              rules.length.should.equal(2);
            });

            it('Add raw rule objects with addCollection', function() {
              cssc.addCollection(rulesSet);
              cssc.getAll().length.should.equal(3);
              clsm.getAll().length.should.equal(3);
            });

            it('Add raw rule objects twice with addCollection do not duplucate rules', function() {
              var coll1 = cssc.addCollection(rulesSet2);
              var coll2 = cssc.addCollection(rulesSet2);
              cssc.getAll().length.should.equal(3);
              clsm.getAll().length.should.equal(3);
              coll1.should.deep.equal(coll2);
            });

            it('Add raw rule objects with width via addCollection', function() {
              var coll1 = cssc.addCollection(rulesSet2);
              coll1[2].get('maxWidth').should.equal(rulesSet2[2].maxWidth);
            });

        });
      }
    };

});
