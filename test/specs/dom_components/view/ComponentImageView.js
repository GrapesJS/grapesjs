const ComponentImageView = require('dom_components/view/ComponentImageView');
const Component = require('dom_components/model/Component');

module.exports = {
  run() {

      describe('ComponentImageView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;

        before(() => {
          $fixtures = $("#fixtures");
          $fixture = $('<div class="components-fixture"></div>');
        });

        beforeEach(() => {
          model = new Component();
          view = new ComponentImageView({
            model
          });
          $fixture.empty().appendTo($fixtures);
          $fixture.html(view.render().el);
        });

        afterEach(() => {
          view.remove();
        });

        after(() => {
          $fixture.remove();
        });

        it('Component empty', () => {
          expect(view.el.getAttribute('onmousedown')).toEqual('return false');
          expect(view.el.getAttribute('class')).toEqual(view.classEmpty);
        });

        it('TagName is <img>', () => {
          expect(view.el.tagName).toEqual('IMG');
        });

        it('Update src attribute', () => {
          model.set('src', './');
          expect(view.el.getAttribute('src')).toEqual('./');
        });

        it('Renders correctly', () => {
          expect(view.render()).toExist();
        });
    });
  }
};
