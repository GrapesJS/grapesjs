var modulePath = './../../../test/specs/css_composer';

define([
				'CssComposer',
				modulePath + '/model/CssModels'
				 ],
	function(
					CssComposer,
					Models,
					Selectors
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
					var rule = this.obj.newRule(sel.models, 'state1', 'width1');
					this.obj.addRule(rule);
					this.obj.getRules().length.should.equal(1);
					this.obj.getRules().at(0).get('selectors').at(0).get('name').should.equal('test1');
				});

/*
				it("Don't duplicate rules", function() {
					var sel1 = new this.obj.Selectors([{name: 'test1'}]);
					var rule1 = this.obj.newRule(sel1.models, 'state1', 'width1');
					var aRule1 = this.obj.addRule(rule1);

					var sel2 = new this.obj.Selectors([{name: 'test1'}]);
					var rule2 = this.obj.newRule(sel2.models, 'state1', 'width1');
					var aRule2 = this.obj.addRule(rule2);

					console.log(sel1);
					console.log(rule1);
					console.log(aRule1);
					console.log(sel2);
					console.log(rule2);
					console.log(aRule2);
					console.log(this.obj.getRules().length);

					aRule1.should.deep.equal(aRule2);

				});
*/

			});

			Models.run();

		});
});