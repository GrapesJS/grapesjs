const PanelsView = require('panels/view/PanelsView');
const Panels = require('panels/model/Panels');

module.exports = {
  run() {
      describe('PanelsView', () => {

        var fixtures;
        var $fixture;
        var model;
        var view;

        beforeEach(() => {
          model = new Panels([]);
          view = new PanelsView({
            collection: model
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.querySelector('#fixtures');
          fixtures.appendChild(view.render().el);
        });

        afterEach(() => {
          view.collection.reset();
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
