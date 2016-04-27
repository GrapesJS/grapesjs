var path = 'DomComponents/view/';
define([path + 'ComponentsView', 'DomComponents/model/Components'],
  function(ComponentsView, Components) {

    return {
      run : function(){
          describe('ComponentsView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;

            before(function () {
              $fixtures = $("#fixtures");
              $fixture = $('<div class="components-fixture"></div>');
            });

            beforeEach(function () {
              model = new Components([]);
              view = new ComponentsView({
                collection: model
              });
              $fixture.empty().appendTo($fixtures);
              $fixture.html(view.render().el);
            });

            afterEach(function () {
              view.collection.reset();
            });

            after(function () {
              $fixture.remove();
            });

            it("Collection is empty", function (){
              view.$el.html().should.be.empty;
            });

            it("Add new component", function (){
              sinon.stub(view, "addToCollection");
              view.collection.add({});
              view.addToCollection.calledOnce.should.equal(true);
            });

            it("Render new component", function (){
              view.collection.add({});
              view.$el.html().should.not.be.empty;
            });

        });
      }
    };

});