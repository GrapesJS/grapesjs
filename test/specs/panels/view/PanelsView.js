var path = 'Panels/view/';
define([path + 'PanelsView', 'Panels/model/Panels'],
  function(PanelsView, Panels) {

    return {
      run : function(){
          describe('PanelsView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;

            before(function () {
              $fixtures  = $("#fixtures");
              $fixture   = $('<div class="cssrules-fixture"></div>');
            });

            beforeEach(function () {
              model = new Panels([]);
              view = new PanelsView({
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

            it("Add new panel", function (){
              sinon.stub(view, "addToCollection");
              view.collection.add({});
              view.addToCollection.calledOnce.should.equal(true);
            });

            it("Render new panel", function (){
              view.collection.add({});
              view.$el.html().should.not.be.empty;
            });

        });
      }
    };

});