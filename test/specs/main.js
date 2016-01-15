define(function(require) {
	describe('Main', function() {
		describe('Startup', function() {
			it('main object should be loaded', function() {
				Grapes = require('editor/main');
				Grapes.should.be.exist;
			});
		});
	});

});