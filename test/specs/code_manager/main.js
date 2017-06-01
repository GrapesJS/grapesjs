define(function(require, exports, module){
  'use strict';
  var CodeManager = require('CodeManager');
  var Models = require('undefined');

		describe('Code Manager', function() {

			describe('Main', function() {

				var obj;

				beforeEach(function () {
					obj 	= new CodeManager();
				});

				afterEach(function () {
					delete obj;
				});

				it('Object exists', function() {
					CodeManager.should.be.exist;
				});

				it('No code generators inside', function() {
					obj.getGenerators().should.be.empty;
				});

				it('No code viewers inside', function() {
					obj.getViewers().should.be.empty;
				});

				it('Add and get code generator', function() {
					obj.addGenerator('test', 'gen');
					obj.getGenerator('test').should.equal('gen');
				});

				it('Add and get code viewer', function() {
					obj.addViewer('test', 'view');
					obj.getViewer('test').should.equal('view');
				});

			});

			Models.run();

		});
});