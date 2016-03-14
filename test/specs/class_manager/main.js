var modulePath = './../../../test/specs/class_manager';

define([
				'ClassManager',
				modulePath + '/model/ClassModels',
				modulePath + '/view/ClassTagView',
				modulePath + '/view/ClassTagsView',
				modulePath + '/e2e/ClassManager'
				 ],
	function(
					ClassManager,
					Models,
					ClassTagView,
					ClassTagsView,
					e2e
					) {

		describe('Class Manager', function() {

			describe('Main', function() {

				beforeEach(function () {
					this.obj 	= new ClassManager();
				});

				afterEach(function () {
					delete this.obj;
				});

				it('Object exists', function() {
					ClassManager.should.be.exist;
				});

				it('No classes inside', function() {
					this.obj.getClasses().length.should.equal(0);
				});

				it('Able to add default classes', function() {
					var cm = new ClassManager({
						defaults: ['test1', 'test2', 'test3'],
					});
					cm.getClasses().length.should.equal(3);
				});

				it('Add new class', function() {
					this.obj.addClass('test');
					this.obj.getClasses().length.should.equal(1);
				});

				it('Check name property', function() {
					var className = 'test';
					var obj = this.obj.addClass(className);
					obj.get('name').should.equal(className);
				});

				it('Add 2 classes', function() {
					this.obj.addClass('test');
					this.obj.addClass('test2');
					this.obj.getClasses().length.should.equal(2);
				});

				it('Add 2 same classes', function() {
					this.obj.addClass('test');
					this.obj.addClass('test');
					this.obj.getClasses().length.should.equal(1);
				});

				it('Get class', function() {
					var className = 'test';
					var obj = this.obj.addClass(className);
					(this.obj.getClass(className) === null).should.equal(false);
				});

				it('Get empty class', function() {
					(this.obj.getClass('test') === null).should.equal(true);
				});

				it('Get same class', function() {
					var className = 'test';
					var obj = this.obj.addClass(className);
					var obj2 = this.obj.getClass(className);
					obj2.should.deep.equal(obj);
				});

			});

			Models.run();
			ClassTagView.run();
			ClassTagsView.run();
			e2e.run();

		});
});