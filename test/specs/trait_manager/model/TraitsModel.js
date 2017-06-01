define(function(require, exports, module){
  'use strict';
  var Trait = require('TraitManager/model/Trait');
  var Component = require('DomComponents/model/Component');

		module.exports = {
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