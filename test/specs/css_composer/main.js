var modulePath = './../../../test/specs/css_composer';

define([
				'CssComposer',
				modulePath + '/model/CssModels',
				modulePath + '/view/CssRuleView',
				modulePath + '/view/CssRulesView',
				modulePath + '/e2e/CssComposer',
				'./../test_utils.js'
				 ],
	function(
					CssComposer,
					Models,
					CssRuleView,
					CssRulesView,
					e2e,
					utils
					) {

		describe('Css Composer', function() {

			describe('Main', function() {

				var obj;

				var config;
				var storagMock = utils.storageMock();
				var editorModel = {
					getCss: function(){return 'testCss';},
					getCacheLoad: function(){
						return storagMock.load();
					}
				};

				var setSmConfig = function(){
					config.stm = storagMock;
					config.stm.getConfig =  function(){
						return { storeCss: 1, storeStyles: 1}
					};
				};
				var setEm = function(){
					config.em = editorModel;
				}


				beforeEach(function () {
					config = {};
					obj = new CssComposer().init(config);
				});

				afterEach(function () {
					delete obj;
				});

				it('Object exists', function() {
					CssComposer.should.be.exist;
				});

				it('storageKey returns array', function() {
					obj.storageKey().should.be.instanceOf(Array);
				});

				it('storageKey returns correct composition', function() {
					setSmConfig();
					obj.storageKey().should.eql(['css', 'styles']);
				});

				it('Store data', function() {
					setSmConfig();
					setEm();
					var expected = { css: 'testCss', styles: '[]',};
					obj.store(1).should.deep.equal(expected);
				});

				it("Rules are empty", function() {
					obj.getAll().length.should.equal(0);
				});

				it('Create new rule with correct selectors', function() {
					var sel = new obj.Selectors();
					var s1 = sel.add({name: 'test1'});
					var rule = obj.add(sel.models);
					rule.get('selectors').at(0).should.deep.equal(s1);
				});

				it('Create new rule correctly', function() {
					var sel = new obj.Selectors();
					var s1 = sel.add({name: 'test1'});
					var rule = obj.add(sel.models, 'state1', 'width1');
					rule.get('state').should.equal('state1');
					rule.get('maxWidth').should.equal('width1');
				});

				it("Add rule to collection", function() {
					var sel = new obj.Selectors([{name: 'test1'}]);
					var rule = obj.add(sel.models);
					obj.getAll().length.should.equal(1);
					obj.getAll().at(0).get('selectors').at(0).get('name').should.equal('test1');
				});

				it("Returns correct rule with the same selector", function() {
					var sel = new obj.Selectors([{name: 'test1'}]);
					var rule1 = obj.add(sel.models);
					var rule2 = obj.get(sel.models);
					rule1.should.deep.equal(rule2);
				});

				it("Returns correct rule with the same selectors", function() {
					var sel1 = new obj.Selectors([{name: 'test1'}]);
					var rule1 = obj.add(sel1.models);

					var sel2 = new obj.Selectors([{name: 'test21'}, {name: 'test22'}]);
					var rule2 = obj.add(sel2.models);

					var rule3 = obj.get(sel2.models);
					rule3.should.deep.equal(rule2);
				});

				it("Do not create multiple rules with the same name selectors", function() {
					var sel1 = new obj.Selectors([{name: 'test21'}, {name: 'test22'}]);
					var rule1 = obj.add(sel1.models);

					var sel2 = new obj.Selectors([{name: 'test22'}, {name: 'test21'}]);
					var rule2 = obj.add(sel2.models);
					rule2.should.deep.equal(rule1);
				});

				it("Don't duplicate rules", function() {
					var sel = new obj.Selectors([]);
					var s1 = sel.add({name: 'test1'});
					var s2 = sel.add({name: 'test2'});
					var s3 = sel.add({name: 'test3'});

					var rule1 = obj.add([s1, s3]);
					var rule2 = obj.add([s3, s1]);

					rule2.should.deep.equal(rule1);
				});

				it("Returns correct rule with the same mixed selectors", function() {
					var sel = new obj.Selectors([]);
					var s1 = sel.add({name: 'test1'});
					var s2 = sel.add({name: 'test2'});
					var s3 = sel.add({name: 'test3'});
					var rule1 = obj.add([s1, s3]);
					var rule2 = obj.get([s3, s1]);
					rule2.should.deep.equal(rule1);
				});

				it("Returns correct rule with the same selectors and state", function() {
					var sel = new obj.Selectors([]);
					var s1 = sel.add({name: 'test1'});
					var s2 = sel.add({name: 'test2'});
					var s3 = sel.add({name: 'test3'});
					var rule1 = obj.add([s1, s3], 'hover');
					var rule2 = obj.get([s3, s1], 'hover');
					rule2.should.deep.equal(rule1);
				});

				it("Returns correct rule with the same selectors, state and width", function() {
					var sel = new obj.Selectors([]);
					var s1 = sel.add({name: 'test1'});
					var rule1 = obj.add([s1], 'hover','1');
					var rule2 = obj.get([s1], 'hover', '1');
					rule2.should.deep.equal(rule1);
				});

				it("Renders correctly", function() {
					obj.render().should.be.ok;
				});

			});

			Models.run();
			CssRuleView.run();
			CssRulesView.run();
			e2e.run();

		});
});
