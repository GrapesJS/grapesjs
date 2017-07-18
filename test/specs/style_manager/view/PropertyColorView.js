const PropertyColorView = require('style_manager/view/PropertyColorView');
const Property = require('style_manager/model/Property');
const Component = require('dom_components/model/Component');

module.exports = {
  run() {

      describe('PropertyColorView', () => {

        var component;
        var $fixtures;
        var $fixture;
        var target;
        var model;
        var view;
        var propTarget;
        var propName = 'testprop';
        var propValue = '#fff';
        var defValue = 'test2value';

        before(() => {
          $.fn.spectrum = () => {};
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="sm-fixture"></div>');
        });

        beforeEach(() => {
          target = new Component();
          component = new Component();
          model = new Property({
            type: 'color',
            property: propName
          });
          propTarget = Object.assign({}, Backbone.Events);
          propTarget.model = component;
          view = new PropertyColorView({
            model,
            propTarget
          });
          $fixture.empty().appendTo($fixtures);
          $fixture.html(view.render().el);
        });

        afterEach(() => {
          //view.remove(); // strange errors ???
        });

        after(() => {
          $fixture.remove();
          component = null;
          view = null;
          model = null;
        });

        it('Rendered correctly', () => {
          var prop = view.el;
          expect($fixture.get(0).querySelector('.property')).toExist();
          expect(prop.querySelector('.label')).toExist();
          expect(prop.querySelector('.field')).toExist();
        });

        it('Inputs rendered', () => {
          var prop = view.el;
          expect(prop.querySelector('input[type=text]')).toExist();
          expect(prop.querySelector('.field-color-picker')).toExist();
        });

        it('Inputs should exist', () => {
          expect(view.$input).toExist();
          expect(view.$color).toExist();
        });

        it('Input value is empty', () => {
          expect(view.model.get('value')).toNotExist();
          expect(view.$input.val()).toNotExist();
        });

        it('Update model on setValue', () => {
          view.setValue(propValue);
          expect(view.model.get('value')).toEqual(propValue);
          expect(view.$input.val()).toEqual(propValue);
        });

        it('Update model on input change', () => {
          view.$input.val(propValue).trigger('change');
          expect(view.model.get('value')).toEqual(propValue);
        });

        it('Update input on value change', () => {
          view.model.set('value', propValue);
          expect(view.getInputValue()).toEqual(propValue);
        });

        it('Update target on value change', () => {
          view.selectedComponent = component;
          view.model.set('value', propValue);
          var compStyle = view.selectedComponent.get('style');
          var assertStyle = {};
          assertStyle[propName] = propValue;
          expect(compStyle).toEqual(assertStyle);
        });

        describe('With target setted', () => {

          beforeEach(() => {
            target.model = component;
            view = new PropertyColorView({
              model,
              propTarget: target
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          it('Update value and input on target swap', () => {
            var style = {};
            style[propName] = propValue;
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual(propValue);
            expect(view.getInputValue()).toEqual(propValue);
          });

          it('Update value after multiple swaps', () => {
            var style = {};
            style[propName] = propValue;
            component.set('style', style);
            view.propTarget.trigger('update');
            style[propName] = '#123123';
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual('#123123');
            expect(view.getInputValue()).toEqual('#123123');
          });

        })

        describe('Init property', () => {

          beforeEach(() => {
            component = new Component();
            model = new Property({
              type: 'color',
              property: propName,
              defaults: propValue,
            });
            view = new PropertyColorView({
              model
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          it('Value as default', () => {
            expect(view.model.get('value')).toEqual(propValue);
          });

          it('Input value is as default', () => {
            expect(view.$input.val()).toEqual(propValue);
          });

        });

    });
  }
};
