const DomComponents = require('dom_components');
const ComponentsView = require('dom_components/view/ComponentsView');
const Components = require('dom_components/model/Components');

module.exports = {
  run() {
      describe('ComponentsView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;
        var dcomp;
        var compOpts;

        before(() => {
          $fixtures = $("#fixtures");
          $fixture = $('<div class="components-fixture"></div>');
        });

        beforeEach(() => {
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

        afterEach(() => {
          view.collection.reset();
        });

        after(() => {
          $fixture.remove();
        });

        it("Collection is empty", () => {
          expect(view.$el.html()).toNotExist();
        });

        it("Add new component", () => {
          sinon.stub(view, "addToCollection");
          view.collection.add({});
          expect(view.addToCollection.calledOnce).toEqual(true);
        });

        it("Render new component", () => {
          view.collection.add({});
          expect(view.$el.html()).toExist();
        });

    });
  }
};
