const ButtonsView = require('panels/view/ButtonsView');
const Buttons = require('panels/model/Buttons');

module.exports = {
  run() {
      describe('ButtonsView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;

        before(() => {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="cssrules-fixture"></div>');
        });

        beforeEach(() => {
          model = new Buttons([]);
          view = new ButtonsView({
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

        it("Add new button", () => {
          sinon.stub(view, "addToCollection");
          view.collection.add({});
          expect(view.addToCollection.calledOnce).toEqual(true);
        });

        it("Render new button", () => {
          view.collection.add({});
          expect(view.$el.html()).toExist();
        });

    });
  }
};
