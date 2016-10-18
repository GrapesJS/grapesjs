var path = 'Panels/view/';
define([path + 'ButtonsView', 'Panels/model/Buttons'],
  function(ButtonsView, Buttons) {

    return {
      run : function(){
          describe('ButtonsView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;

            before(function () {
              $fixtures  = $("#fixtures");
              $fixture   = $('<div class="cssrules-fixture"></div>');
            });

            beforeEach(function () {
              model = new Buttons([]);
              view = new ButtonsView({
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

            it("Add new button", function (){
              sinon.stub(view, "addToCollection");
              view.collection.add({});
              view.addToCollection.calledOnce.should.equal(true);
            });

            it("Render new button", function (){
              view.collection.add({});
              view.$el.html().should.not.be.empty;
            });

        });
      }
    };

});