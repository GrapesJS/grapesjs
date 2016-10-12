var modulePath = 'TraitManager';
define([modulePath+'/view/TraitView',
modulePath+'/model/Trait',
'DomComponents/model/Component'],
	function(TraitView, Trait, Component) {

		return {
			run: function(){

				describe('TraitView', function() {

          var obj;
					var model;
					var modelName = 'title';
					var target;

          beforeEach(function () {
						target = new Component();
						model = new Trait({
							name: modelName,
							target: target,
						});
            obj = new TraitView({
							model: model,
						});
          });

          afterEach(function () {
            delete obj;
						delete model;
						delete target;
          });

					it('Object exists', function() {
						Trait.should.be.exist;
					});

					it('Target has no attributes on init', function() {
						target.get('attributes').should.deep.equal({});
					});

					it('On update of the value updates the target attributes', function() {
						model.set('value', 'test');
						var eq = {};
						eq[modelName] = 'test';
						target.get('attributes').should.deep.equal(eq);
					});

					it('Updates on different models do not alter other targets', function() {
						var target1 = new Component();
						var target2 = new Component();
						var model1 = new Trait({
							name: modelName,
							target: target1,
						});
						var model2 = new Trait({
							name: modelName,
							target: target2,
						});
						var obj1 = new TraitView({model: model1});
						var obj2 = new TraitView({model: model2});

						model1.set('value', 'test1');
						model2.set('value', 'test2');
						var eq1 = {};
						eq1[modelName] = 'test1';
						var eq2 = {};
						eq2[modelName] = 'test2';
						target1.get('attributes').should.deep.equal(eq1);
						target2.get('attributes').should.deep.equal(eq2);
					});

				});
			}
		}
});
