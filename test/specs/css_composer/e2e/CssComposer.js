module.exports = {
  run() {
      describe('E2E tests', () => {
        var fixtures;
        var fixture;
        var gjs;
        var cssc;
        var clsm;
        var domc;
        var rulesSet;
        var rulesSet2;

        before(() => {
          fixtures = $("#fixtures");
          fixture = $('<div class="csscomposer-fixture"></div>');
        });

        beforeEach(done => {
          //this.timeout(5000);
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
            { selectors: [{name: 'test3'}], mediaText:'(max-width: 900px)' }
          ];
          done();
        });

        afterEach(() => {
          gjs = null;
          cssc = null;
          clsm = null;
        });

        after(() => {
          fixture.remove();
        });

        it('Rules are correctly imported from default property', () => {
          var gj = grapesjs.init({
            stylePrefix: '',
            storageManager: { autoload: 0, type:'none' },
            assetManager: { storageType: 'none', },
            cssComposer: { rules: rulesSet},
            container: 'csscomposer-fixture',
          });
          var cssc = gj.editor.get('CssComposer');
          expect(cssc.getAll().length).toEqual(rulesSet.length);
          var cls = gj.editor.get('SelectorManager').getAll();
          expect(cls.length).toEqual(3);
        });


        it('New rule adds correctly the class inside selector manager', () => {
          var rules = cssc.getAll();
          rules.add({ selectors: [{name: 'test1'}] });
          expect(clsm.getAll().at(0).get('name')).toEqual('test1');
        });

        it('New rules are correctly imported inside selector manager', () => {
          var rules = cssc.getAll();
          rulesSet.forEach(item => {
            rules.add(item);
          });
          var cls = clsm.getAll();
          expect(cls.length).toEqual(3);
          expect(cls.at(0).get('name')).toEqual('test1');
          expect(cls.at(1).get('name')).toEqual('test2');
          expect(cls.at(2).get('name')).toEqual('test3');
        });

        it('Add rules from the new component added as a string with style tag', () => {
          var comps = domc.getComponents();
          var rules = cssc.getAll();
          comps.add("<div>Test</div><style>.test{color: red} .test2{color: blue}</style>");
          expect(comps.length).toEqual(1);
          expect(rules.length).toEqual(2);
        });

        it('Add raw rule objects with addCollection', () => {
          cssc.addCollection(rulesSet);
          expect(cssc.getAll().length).toEqual(3);
          expect(clsm.getAll().length).toEqual(3);
        });

        it('Add raw rule objects twice with addCollection do not duplucate rules', () => {
          var rulesSet2Copy = JSON.parse(JSON.stringify(rulesSet2));
          var coll1 = cssc.addCollection(rulesSet2);
          var coll2 = cssc.addCollection(rulesSet2Copy);
          expect(cssc.getAll().length).toEqual(3);
          expect(clsm.getAll().length).toEqual(3);
          expect(coll1).toEqual(coll2);
        });

        it("Extend css rule style, if requested", () => {
          var style1 = {color: 'red', width: '10px'};
          var style2 = {height: '20px', width: '20px'};
          var rule1 = {
            selectors: ['test1'],
            style: style1,
          };
          var rule2 = {
            selectors: ['test1'],
            style: style2,
          };
          var ruleOut = cssc.addCollection(rule1)[0];
          // ruleOut is a Model
          ruleOut = JSON.parse(JSON.stringify(ruleOut));
          var ruleResult = {
            mediaText: '',
            selectors: [{
             active: true,
             label: 'test1',
             name: 'test1',
             type: 'class',
            }],
            selectorsAdd: '',
            state: '',
            stylable: true,
            style: {
             color: 'red',
             width: '10px'
            }
          };
          expect(ruleOut).toEqual(ruleResult);
          var ruleOut = cssc.addCollection(rule2, {extend: 1})[0];
          ruleOut = JSON.parse(JSON.stringify(ruleOut));
          ruleResult.style = {
            color: 'red',
            height: '20px',
            width: '20px',
          }
          expect(ruleOut).toEqual(ruleResult);

        });

        it("Do not extend with different selectorsAdd", () => {
          var style1 = {color: 'red', width: '10px'};
          var style2 = {height: '20px', width: '20px'};
          var rule1 = {
            selectors: [],
            selectorsAdd: '*',
            style: style1,
          };
          var rule2 = {
            selectors: [],
            selectorsAdd: 'p',
            style: style2,
          };
          var rule1Out = cssc.addCollection(rule1, {extend: 1})[0];
          var rule2Out = cssc.addCollection(rule2, {extend: 1})[0];
          rule1Out = JSON.parse(JSON.stringify(rule1Out));
          rule2Out = JSON.parse(JSON.stringify(rule2Out));
          var rule1Result = {
            mediaText: '',
            selectors: [],
            selectorsAdd: '*',
            state: '',
            stylable: true,
            style: {
             color: 'red',
             width: '10px'
            }
          };
          var rule2Result = {
            mediaText: '',
            selectors: [],
            selectorsAdd: 'p',
            state: '',
            stylable: true,
            style: {
              height: '20px',
              width: '20px',
            }
          };
          expect(rule1Out).toEqual(rule1Result);
          expect(rule2Out).toEqual(rule2Result);
        });

        it('Add raw rule objects with width via addCollection', () => {
          var coll1 = cssc.addCollection(rulesSet2);
          expect(coll1[2].get('mediaText')).toEqual(rulesSet2[2].mediaText);
        });
      });
  }
};
