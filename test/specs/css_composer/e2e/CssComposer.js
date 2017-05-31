define(function(require, exports, module){
  'use strict';
  var GrapesJS = require('GrapesJS');

    module.exports = {
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
                { selectors: [{name: 'test3'}], mediaText:'(max-width: 900px)' }
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
              var rulesSet2Copy = JSON.parse(JSON.stringify(rulesSet2));
              var coll1 = cssc.addCollection(rulesSet2);
              var coll2 = cssc.addCollection(rulesSet2Copy);
              cssc.getAll().length.should.equal(3);
              clsm.getAll().length.should.equal(3);
              coll1.should.deep.equal(coll2);
            });

            it("Extend css rule style, if requested", function() {
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
              ruleOut.should.deep.equal(ruleResult);
              var ruleOut = cssc.addCollection(rule2, {extend: 1})[0];
              ruleOut = JSON.parse(JSON.stringify(ruleOut));
              ruleResult.style = {
                color: 'red',
                height: '20px',
                width: '20px',
              }
              ruleOut.should.deep.equal(ruleResult);

            });

            it("Do not extend with different selectorsAdd", function() {
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
              rule1Out.should.deep.equal(rule1Result);
              rule2Out.should.deep.equal(rule2Result);
            });

            it('Add raw rule objects with width via addCollection', function() {
              var coll1 = cssc.addCollection(rulesSet2);
              coll1[2].get('mediaText').should.equal(rulesSet2[2].mediaText);
            });

        });
      }
    };

});