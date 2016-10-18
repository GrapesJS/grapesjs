var modulePath = './../../../test/specs/selector_manager';

define([
				'SelectorManager',
				modulePath + '/model/SelectorModels',
				modulePath + '/view/ClassTagView',
				modulePath + '/view/ClassTagsView',
				modulePath + '/e2e/ClassManager'
				 ],
	function(
					SelectorManager,
					Models,
					ClassTagView,
					ClassTagsView,
					e2e
					) {

		describe('SelectorManager', function() {

			describe('Main', function() {

				var obj;

				beforeEach(function () {
					obj = new SelectorManager().init();
				});

				afterEach(function () {
					delete obj;
				});

				it('Object exists', function() {
					obj.should.be.exist;
				});

				it('No selectors inside', function() {
					obj.getAll().length.should.equal(0);
				});

				it('Able to add default selectors', function() {
					var cm = new SelectorManager().init({
						selectors: ['test1', 'test2', 'test3'],
					});
					cm.getAll().length.should.equal(3);
				});

				it('Add new selector', function() {
					obj.add('test');
					obj.getAll().length.should.equal(1);
				});

				it('Default new selector is a class type', function() {
					obj.add('test');
					obj.get('test').get('type').should.equal('class');
				});

				it('Check name property', function() {
					var name = 'test';
					var sel = obj.add(name);
					sel.get('name').should.equal(name);
					sel.get('label').should.equal(name);
				});

				it('Add 2 selectors', function() {
					obj.add('test');
					obj.add('test2');
					obj.getAll().length.should.equal(2);
				});

				it('Adding 2 selectors with the same name is not possible', function() {
					obj.add('test');
					obj.add('test');
					obj.getAll().length.should.equal(1);
				});

				it('Get selector', function() {
					var name = 'test';
					var sel = obj.add(name);
					obj.get(name).should.deep.equal(sel);
				});

				it('Get empty class', function() {
					(obj.get('test') === undefined).should.equal(true);
				});

			});

			Models.run();
			ClassTagView.run();
			ClassTagsView.run();
			e2e.run();

		});
});