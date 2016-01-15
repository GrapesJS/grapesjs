define(['componentView','componentModel'],
		function(componentView,componentModel) {	
	
			describe("ComponentView", function () {
				before(function () {
					this.$fixture = $("<div id='component-fixture'></div>");
				});
	
				beforeEach(function () {
					this.view = new componentView({
						model: new componentModel({}),
					});
					this.$fixture.empty().appendTo($("#fixtures"));
					this.$fixture.html(this.view.render().el);
				});
	
				afterEach(function () {
					this.view.model.destroy();
				});
	
				after(function () {
					this.$fixture.remove();
				});
	
				it("Render componente vuoto", function (){
					this.view.$el.html().should.be.empty;
				});
				it("Render dopo la modifica", function (done){
					var view = this.view,  spy = sinon.spy();
					
					view.$el.html().should.be.empty;
					view.$el.attr('style').should.be.empty;
					view.$el.css('width').should.equal('0px');
					view.model.on("change", spy);
					spy.called.should.equal(false);
					
					view.model.once("change",function(){
						view.$el.attr('style').should.be.not.empty;
						view.$el.css('width').should.equal('100px');
						spy.called.should.equal(true);
						done();
					});
					view.model.set({
						css : { 'width':'100px' },
						attributes: {'data-t':'read'},
					});
				});
	});
});