var modulePath = './../../../test/specs/css_composer';

define([
				'CssComposer',
				modulePath + '/model/CssModels',
				modulePath + '/view/CssRuleView'
				 ],
	function(
					CssComposer,
					Models,
					CssRuleView
					) {

		describe('Css Composer', function() {

			describe('Main', function() {

				beforeEach(function () {
					this.obj 	= new CssComposer();
				});

				afterEach(function () {
					delete this.obj;
				});

				it('Object exists', function() {
					CssComposer.should.be.exist;
				});

				it("Rules are empty", function() {
					this.obj.getRules().length.should.equal(0);
				});

				it('Create new rule with correct selectors', function() {
					var sel = new this.obj.Selectors();
					var s1 = sel.add({name: 'test1'});
					var rule = this.obj.newRule(sel.models);
					rule.get('selectors').at(0).should.deep.equal(s1);
				});

				it('Create new rule correctly', function() {
					var sel = new this.obj.Selectors();
					var s1 = sel.add({name: 'test1'});
					var rule = this.obj.newRule(sel.models, 'state1', 'width1');
					rule.get('state').should.equal('state1');
					rule.get('maxWidth').should.equal('width1');
				});

				it("Add rule to collection", function() {
					var sel = new this.obj.Selectors([{name: 'test1'}]);
					var rule = this.obj.newRule(sel.models);
					this.obj.addRule(rule);
					this.obj.getRules().length.should.equal(1);
					this.obj.getRules().at(0).get('selectors').at(0).get('name').should.equal('test1');
				});

				it("Returns correct rule with the same selector", function() {
					var sel = new this.obj.Selectors([{name: 'test1'}]);
					var rule1 = this.obj.newRule(sel.models);
					this.obj.addRule(rule1);
					var rule2 = this.obj.getRule(sel.models);
					rule1.should.deep.equal(rule2);
				});

				it("Returns correct rule with the same selectors", function() {
					var sel1 = new this.obj.Selectors([{name: 'test1'}]);
					var rule1 = this.obj.newRule(sel1.models);
					this.obj.addRule(rule1);

					var sel2 = new this.obj.Selectors([{name: 'test21'}, {name: 'test22'}]);
					var rule2 = this.obj.newRule(sel2.models);
					this.obj.addRule(rule2);

					var rule3 = this.obj.getRule(sel2.models);
					rule3.should.deep.equal(rule2);
				});

				it("Don't duplicate rules", function() {
					var sel = new this.obj.Selectors([]);
					var s1 = sel.add({name: 'test1'});
					var s2 = sel.add({name: 'test2'});
					var s3 = sel.add({name: 'test3'});

					var rule1 = this.obj.newRule([s1, s3]);
					var aRule1 = this.obj.addRule(rule1);

					var rule2 = this.obj.newRule([s3, s1]);
					var aRule2 = this.obj.addRule(rule2);

					aRule2.should.deep.equal(aRule1);
				});

				it("Returns correct rule with the same mixed selectors", function() {
					var sel = new this.obj.Selectors([]);
					var s1 = sel.add({name: 'test1'});
					var s2 = sel.add({name: 'test2'});
					var s3 = sel.add({name: 'test3'});
					var rule1 = this.obj.newRule([s1, s3]);
					this.obj.addRule(rule1);

					var rule2 = this.obj.getRule([s3, s1]);
					rule2.should.deep.equal(rule1);
				});

				it("Returns correct rule with the same selectors and state", function() {
					var sel = new this.obj.Selectors([]);
					var s1 = sel.add({name: 'test1'});
					var s2 = sel.add({name: 'test2'});
					var s3 = sel.add({name: 'test3'});
					var rule1 = this.obj.newRule([s1, s3], 'hover');
					this.obj.addRule(rule1);

					var rule2 = this.obj.getRule([s3, s1], 'hover');
					rule2.should.deep.equal(rule1);
				});

				it("Returns correct rule with the same selectors, state and width", function() {
					var sel = new this.obj.Selectors([]);
					var s1 = sel.add({name: 'test1'});
					var rule1 = this.obj.newRule([s1], 'hover','1');
					this.obj.addRule(rule1);

					var rule2 = this.obj.getRule([s1], 'hover', '1');
					rule2.should.deep.equal(rule1);
				});

				it("Renders correctly", function() {
					this.obj.render().should.be.ok;
				});

			});

			Models.run();
			CssRuleView.run();

		});
});