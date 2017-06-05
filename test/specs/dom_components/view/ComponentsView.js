const DomComponents = require('dom_components');
const ComponentsView = require('dom_components/view/ComponentsView');
const Components = require('dom_components/model/Components');

module.exports = {
  run : function() {
      describe('ComponentsView', function() {

        var $fixtures;
        var $fixture;
        var model;
        var view;
        var dcomp;
        var compOpts;

        before(function () {
          $fixtures = $("#fixtures");
          $fixture = $('<div class="components-fixture"></div>');
        });

        beforeEach(function () {
          dcomp = new DomComponents();
          compOpts = {
            defaultTypes: dcomp.componentTypes,
          };
          model = new Components([], compOpts);
          view = new ComponentsView({
            collection: model,
            defaultTypes: dcomp.componentTypes,
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
          expect(view.$el.html()).toNotExist();
        });

        it("Add new component", function (){
          sinon.stub(view, "addToCollection");
          view.collection.add({});
          expect(view.addToCollection.calledOnce).toEqual(true);
        });

        it("Render new component", function (){
          view.collection.add({});
          expect(view.$el.html()).toExist();
        });

    });
  }
};
