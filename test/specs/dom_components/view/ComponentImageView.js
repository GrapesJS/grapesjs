const ComponentImageView = require('dom_components/view/ComponentImageView');
const Component = require('dom_components/model/Component');

module.exports = {
  run : function(){

      describe('ComponentImageView', function() {

        var $fixtures;
        var $fixture;
        var model;
        var view;

        before(function () {
          $fixtures = $("#fixtures");
          $fixture = $('<div class="components-fixture"></div>');
        });

        beforeEach(function () {
          model = new Component();
          view = new ComponentImageView({
            model: model
          });
          $fixture.empty().appendTo($fixtures);
          $fixture.html(view.render().el);
        });

        afterEach(function () {
          view.remove();
        });

        after(function () {
          $fixture.remove();
        });

        it('Component empty', function() {
          expect(view.el.getAttribute('onmousedown')).toEqual('return false');
          expect(view.el.getAttribute('class')).toEqual(view.classEmpty);
        });

        it('TagName is <img>', function() {
          expect(view.el.tagName).toEqual('IMG');
        });

        it('Update src attribute', function() {
          model.set('src', './');
          expect(view.el.getAttribute('src')).toEqual('./');
        });

        it('Renders correctly', function() {
          expect(view.render()).toExist();
        });
    });
  }
};
