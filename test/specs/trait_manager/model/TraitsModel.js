define(['TraitManager/model/Trait', 'DomComponents/model/Component'],
	function(Trait, Component) {

		return {
			run: function(){

				describe('TraitModels', function() {

          var obj;
					var target;
					var modelName = 'title';

          beforeEach(function () {
						target = new Component();
            obj = new Trait({
							name: modelName,
							target: target,
						});
          });

          afterEach(function () {
            delete obj;
          });

					it('Object exists', function() {
						Trait.should.be.exist;
					});

				});
			}
		}
});
