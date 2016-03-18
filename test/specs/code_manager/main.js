var modulePath = './../../../test/specs/code_manager';

define([
				'CodeManager',
				modulePath + '/model/CodeModels',
				//modulePath + '/view/ClassTagView',
				//modulePath + '/view/ClassTagsView',
				//modulePath + '/e2e/ClassManager'
				 ],
	function(
					CodeManager,
					Models
					) {

		describe('Code Manager', function() {

			describe('Main', function() {

				beforeEach(function () {
					this.obj 	= new CodeManager();
				});

				afterEach(function () {
					delete this.obj;
				});

				it('Object exists', function() {
					CodeManager.should.be.exist;
				});

			});

			Models.run();
			//ClassTagView.run();
			//ClassTagsView.run();
			//e2e.run();

		});
});