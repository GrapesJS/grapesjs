const ComponentView = require('dom_components/view/ComponentView');
const Component = require('dom_components/model/Component');
const DomComponents = require('dom_components');

module.exports = {
  run() {

      describe('ComponentView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;
        var hClass = 'hc-state';
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
          model = new Component();
          view = new ComponentView({
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
          expect($fixture.html()).toEqual('<div data-highlightable="1"></div>');
        });

        it('Add helper class on update of state', () => {
          model.set('state', 'test');
          expect($fixture.html()).toEqual('<div data-highlightable="1" class="' + hClass + '"></div>');
        });

        it('Clean form helper state', () => {
          model.set('state', 'test');
          model.set('state', '');
          expect($fixture.html()).toEqual('<div data-highlightable="1" class=""></div>');
        });

        it('Add helper class on status update', () => {
          model.set('status', 'selected');
          expect($fixture.html()).toEqual('<div data-highlightable="1" class="selected"></div>');
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
          expect(view.el.getAttribute('style')).toEqual('');
        });

        it('Get style string', () => {
          model.set('style',  {
            color: 'red',
            float: 'left'
          });
          expect(view.getStyleString()).toEqual('color:red;float:left;');
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
            defaultTypes: dcomp.componentTypes,
          });
          expect(view.render().$el.html()).toEqual('<span data-highlightable="1"></span><div title="test" data-highlightable="1"></div>');
        });

    });
  }
};
