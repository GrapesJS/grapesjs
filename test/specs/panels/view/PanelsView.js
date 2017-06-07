const PanelsView = require('panels/view/PanelsView');
const Panels = require('panels/model/Panels');

module.exports = {
  run() {
      describe('PanelsView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;

        before(() => {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="cssrules-fixture"></div>');
        });

        beforeEach(() => {
          model = new Panels([]);
          view = new PanelsView({
            collection: model
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
          expect(view.$el.html()).toEqual('');
        });

        it("Add new panel", () => {
          sinon.stub(view, "addToCollection");
          view.collection.add({});
          expect(view.addToCollection.calledOnce).toEqual(true);
        });

        it("Render new panel", () => {
          view.collection.add({});
          expect(view.$el.html()).toExist();
        });

    });
  }
};
