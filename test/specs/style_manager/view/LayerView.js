const LayerView = require('style_manager/view/LayerView');
const Layers = require('style_manager/model/Layers');

module.exports = {
  run() {

      describe('LayerView', () => {

        var component;
        var fixtures;
        var target;
        var model;
        var view;

        beforeEach(() => {
          var coll = new Layers();
          model = coll.add({});
          view = new LayerView({
            model
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.firstChild;
          fixtures.appendChild(view.render().el);
        });

        after(() => {
          component = null;
          view = null;
          model = null;
        });

        it('Rendered correctly', () => {
          var layer = view.el;
          expect(fixtures.querySelector('.layer')).toExist();
          expect(layer.querySelector('#label')).toExist();
          expect(layer.querySelector('#close-layer')).toExist();
          expect(view.getPropertiesWrapper()).toExist();
          expect(view.getPreviewEl()).toExist();
        });

        it('Is not active by default', () => {
          expect(view.$el.hasClass('active')).toEqual(false);
        })

        it('Is possible to activate it', () => {
          view.model.set('active', 1);
          expect(view.$el.hasClass('active')).toEqual(true);
        })

        it('Is possible to activate it with active()', () => {
          view.active();
          expect(view.$el.hasClass('active')).toEqual(true);
        })

        it('No preview', () => {
          var style = view.el.querySelector('#preview').style;
          expect(style.cssText).toNotExist();
        });

    });
  }
};
