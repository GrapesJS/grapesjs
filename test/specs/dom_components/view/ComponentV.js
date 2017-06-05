const ComponentView = require('dom_components/view/ComponentView');
const Component = require('dom_components/model/Component');
const DomComponents = require('dom_components');

module.exports = {
  run : function(){

      describe('ComponentView', function() {

        var $fixtures;
        var $fixture;
        var model;
        var view;
        var hClass = 'hc-state';
        var dcomp;
        var compOpts;

        before(function () {
          $fixtures = $("#fixtures");
          $fixture = $('<div class="components-fixture"></div>');
        });

        beforeEach(function () {
          dcomp = new DomComponents();
          compOpts = {
            defaultTypes: dcomp.componentTypes,
          };
          model = new Component();
          view = new ComponentView({
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
          expect($fixture.html()).toEqual('<div data-highlightable="1"></div>');
        });

        it('Add helper class on update of state', function() {
          model.set('state', 'test');
          expect($fixture.html()).toEqual('<div data-highlightable="1" class="' + hClass + '"></div>');
        });

        it('Clean form helper state', function() {
          model.set('state', 'test');
          model.set('state', '');
          expect($fixture.html()).toEqual('<div data-highlightable="1" class=""></div>');
        });

        it('Add helper class on status update', function() {
          model.set('status', 'selected');
          expect($fixture.html()).toEqual('<div data-highlightable="1" class="selected"></div>');
        });

        it('Get string of classes', function() {
          model.set('attributes', { class: ['test', 'test2']});
          expect(view.getClasses()).toEqual('test test2');
        });

        it('Update attributes', function() {
          model.set('attributes', {
            title: 'value',
            'data-test': 'value2',
          });
          expect(view.el.getAttribute('title')).toEqual('value');
          expect(view.el.getAttribute('data-test')).toEqual('value2');
        });

        it('Update style', function() {
          model.set('style', {
            color: 'red',
            float: 'left'
          });
          expect(view.el.getAttribute('style')).toEqual('color:red;float:left;');
        });

        it('Clean style', function() {
          model.set('style', { color: 'red'});
          model.set('style', {});
          expect(view.el.getAttribute('style')).toEqual('');
        });

        it('Get style string', function() {
          model.set('style',  {
            color: 'red',
            float: 'left'
          });
          expect(view.getStyleString()).toEqual('color:red;float:left;');
        });

        it('Add class', function() {
          model.get('classes').add({name: 'test'});
          expect(view.el.getAttribute('class')).toEqual('test');
        });

        it('Add classes', function() {
          model.get('classes').add([{name: 'test'}, {name: 'test2'}]);
          expect(view.el.getAttribute('class')).toEqual('test test2');
        });

        it('Update on remove of some class', function() {
          var cls1 = model.get('classes').add({name: 'test'});
          var cls12 = model.get('classes').add({name: 'test2'});
          model.get('classes').remove(cls1);
          expect(view.el.getAttribute('class')).toEqual('test2');
        });

        it('Init with different tag', function() {
          model = new Component({ tagName: 'span' });
          view = new ComponentView({ model: model });
          expect(view.render().el.tagName).toEqual('SPAN');
        });

        it('Init with nested components', function() {
          model = new Component({
            components: [
              { tagName: 'span'},
              { attributes: { title: 'test'}}
            ]
          }, compOpts);
          view = new ComponentView({
            model: model,
            defaultTypes: dcomp.componentTypes,
          });
          expect(view.render().$el.html()).toEqual('<span data-highlightable="1"></span><div title="test" data-highlightable="1"></div>');
        });

    });
  }
};
