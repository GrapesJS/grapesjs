const SectorsView = require('style_manager/view/SectorsView');
const Sectors = require('style_manager/model/Sectors');

module.exports = {
  run() {

      describe('SectorsView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;

        before(() => {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="sectors-fixture"></div>');
        });

        beforeEach(() => {
          model = new Sectors([]);
          view = new SectorsView({
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
          expect(view.el.innerHTML).toEqual('');
        });

        it("Add new sectors", () => {
          view.collection.add([{}, {}]);
          expect(view.el.children.length).toEqual(2);
        });

    });
  }
};
