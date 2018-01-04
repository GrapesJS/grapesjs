const ComponentView = require('dom_components/view/ComponentView');
const Component = require('dom_components/model/Component');
const DomComponents = require('dom_components');
const Editor = require('editor/model/Editor');

module.exports = {
  run() {

      describe('ComponentView', () => {

        var fixtures;
        var model;
        var view;
        var hClass = 'hc-state';
        var dcomp;
        var compOpts;
        let em;

        beforeEach(() => {
          em = new Editor({});
          dcomp = new DomComponents();
          compOpts = {
            em,
            componentTypes: dcomp.componentTypes,
          };
          model = new Component({}, compOpts);
          view = new ComponentView({
            model
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.querySelector('#fixtures');
          fixtures.appendChild(view.render().el);
        });

        afterEach(() => {
          view.remove();
        });

        it('Component empty', () => {
          expect(fixtures.innerHTML).toEqual('<div data-highlightable="1"></div>');
        });

        it('Add helper class on update of state', () => {
          model.set('state', 'test');
          expect(fixtures.innerHTML).toEqual('<div data-highlightable="1" class="' + hClass + '"></div>');
        });

        it('Clean form helper state', () => {
          model.set('state', 'test');
          model.set('state', '');
          expect(fixtures.innerHTML).toEqual('<div data-highlightable="1" class=""></div>');
        });

        it('Add helper class on status update', () => {
          model.set('status', 'selected');
          expect(fixtures.innerHTML).toEqual('<div data-highlightable="1" class="selected"></div>');
        });

        it('Get string of classes', () => {
          model.set('attributes', { class: ['test', 'test2']});
          expect(view.getClasses()).toEqual('test test2');
        });

        it('Update attributes', () => {
          model.set('attributes', {
            title: 'value',
            'data-test': 'value2',
          });
          expect(view.el.getAttribute('title')).toEqual('value');
          expect(view.el.getAttribute('data-test')).toEqual('value2');
        });

        it('Update style', () => {
          model.set('style', {
            color: 'red',
            float: 'left'
          });
          expect(view.el.getAttribute('style')).toEqual('color:red;float:left;');
        });

        it('Clean style', () => {
          model.set('style', { color: 'red'});
          model.set('style', {});
          expect(view.el.getAttribute('style')).toEqual(null);
        });

        it('Add class', () => {
          model.get('classes').add({name: 'test'});
          expect(view.el.getAttribute('class')).toEqual('test');
        });

        it('Add classes', () => {
          model.get('classes').add([{name: 'test'}, {name: 'test2'}]);
          expect(view.el.getAttribute('class')).toEqual('test test2');
        });

        it('Update on remove of some class', () => {
          var cls1 = model.get('classes').add({name: 'test'});
          var cls12 = model.get('classes').add({name: 'test2'});
          model.get('classes').remove(cls1);
          expect(view.el.getAttribute('class')).toEqual('test2');
        });

        it('Init with different tag', () => {
          model = new Component({ tagName: 'span' });
          view = new ComponentView({ model });
          fixtures.innerHTML = '';
          fixtures.appendChild(view.render().el);
          expect(view.render().el.tagName).toEqual('SPAN');
        });

        it('Init with nested components', () => {
          model = new Component({
            components: [
              { tagName: 'span'},
              { attributes: { title: 'test'}}
            ]
          }, compOpts);
          view = new ComponentView({
            model,
            componentTypes: dcomp.componentTypes,
          });
          fixtures.innerHTML = '';
          fixtures.appendChild(view.render().el);
          expect(view.$el.html()).toEqual('<span data-highlightable="1"></span><div title="test" data-highlightable="1"></div>');
        });

        it('removeClass removes classes from attributes', () => {
          model.addClass('class1');
          model.removeClass('class1');
          const result = model.getAttributes();
          expect(result.class).toEqual(undefined);
        });

    });
  }
};
