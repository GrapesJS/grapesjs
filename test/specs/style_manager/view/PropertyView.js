const PropertyView = require('style_manager/view/PropertyView');
const Property = require('style_manager/model/Property');
const Component = require('dom_components/model/Component');

module.exports = {
  run() {

      describe('PropertyView', () => {

        var component;
        var $fixtures;
        var $fixture;
        var target;
        var model;
        var view;
        var propName = 'testprop';
        var propValue = 'testvalue';
        var defValue = 'testDefault';

        before(() => {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="sm-fixture"></div>');
        });

        beforeEach(() => {
          target = new Component();
          component = new Component();
          model = new Property({property: propName});
          view = new PropertyView({
            model
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
        });

        it('Rendered correctly', () => {
          var prop = view.el;
          expect($fixture.get(0).querySelector('.property')).toExist();
          expect(prop.querySelector('.label')).toExist();
          expect(prop.querySelector('.field')).toExist();
        });

        it('Input should exist', () => {
          expect(view.$input).toExist();
        });

        it('Input value is empty', () => {
          expect(view.model.get('value')).toNotExist();
          expect(view.$input.val()).toNotExist();
        });

        it('Model not change without update trigger', () => {
          view.$input.val(propValue);
          expect(view.model.get('value')).toNotExist();
        });

        // Tests valueUpdated()
        it('Update model on input change', () => {
          view.$input.val(propValue).trigger('change');
          expect(view.model.get('value')).toEqual(propValue);
        });

        // Tests getValueForTarget()
        it('Get value for target', () => {
          view.model.set('value', propValue);
          expect(view.getValueForTarget()).toEqual(propValue);
        });

        // Tests valueChanged() -> ...
        it('Update input on value change', () => {
          view.model.set('value', propValue);
          expect(view.$input.val()).toEqual(propValue);
        });

        it('Update target on value change', () => {
          view.selectedComponent = component;
          view.model.set('value', propValue);
          var compStyle = view.selectedComponent.get('style');
          var assertStyle = {};
          assertStyle[propName] = propValue;
          expect(compStyle).toEqual(assertStyle);
        });

        it('Update target on value change with functionName', () => {
          view.selectedComponent = component;
          view.model.set('functionName', 'testfunc');
          view.model.set('value', propValue);
          var compStyle = view.selectedComponent.get('style');
          var assertStyle = {};
          assertStyle[propName] = 'testfunc(' + propValue + ')';
          expect(compStyle).toEqual(assertStyle);
        });

        it('Clean target from the property if its value is empty', () => {
          view.selectedComponent = component;
          view.model.set('value', propValue);
          view.model.set('value', '');
          var compStyle = view.selectedComponent.get('style');
          expect(compStyle).toEqual({});
        });

        it('Check stylable element', () => {
          view.selectedComponent = component;
          expect(view.isTargetStylable()).toEqual(true);
          component.set('stylable', false);
          expect(view.isTargetStylable()).toEqual(false);
          component.set('stylable', [propName]);
          expect(view.isTargetStylable()).toEqual(true);
          component.set('stylable', ['test1', propName]);
          expect(view.isTargetStylable()).toEqual(true);
          component.set('stylable', ['test1', 'test2']);
          expect(view.isTargetStylable()).toEqual(false);
        });

        it('Target style is empty without values', () => {
          view.selectedComponent = component;
          expect(view.getComponentValue()).toNotExist();
        });

        it('Target style is correct', () => {
          view.selectedComponent = component;
          var style = {};
          style[propName] = propValue;
          component.set('style', style);
          expect(view.getComponentValue()).toEqual(propValue);
        });

        it('Target style is empty with an other style', () => {
          view.selectedComponent = component;
          var style = {};
          style[propName + '2'] = propValue;
          component.set('style', style);
          expect(view.getComponentValue()).toNotExist();
        });

        it('Fetch value from function', () => {
          view.selectedComponent = component;
          var style = {};
          style[propName] = 'testfun(' + propValue + ')';
          component.set('style', style);
          view.model.set('functionName', 'testfun');
          expect(view.getComponentValue()).toEqual(propValue);
        });

        describe('With target setted', () => {

          beforeEach(() => {
            target.model = component;
            view = new PropertyView({
              model,
              propTarget: target
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          it('updateTargetStyle', () => {
            view.updateTargetStyle(propValue);
            var style = {};
            style[propName] = propValue;
            expect(component.get('style')).toEqual(style);
          });

          it('updateTargetStyle with custom property', () => {
            view.updateTargetStyle(propValue, propName + '2');
            var style = {};
            style[propName + '2'] = propValue;
            expect(component.get('style')).toEqual(style);
          });

          it('Update value and input on target swap', () => {
            var style = {};
            style[propName] = propValue;
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual(propValue);
            expect(view.$input.val()).toEqual(propValue);
          });

          it('Update value after multiple swaps', () => {
            var style = {};
            style[propName] = propValue;
            component.set('style', style);
            view.propTarget.trigger('update');
            style[propName] = propValue + '2';
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual(propValue + '2');
            expect(view.$input.val()).toEqual(propValue + '2');
          });

        })

        describe('Init property', () => {

          beforeEach(() => {
            component = new Component();
            model = new Property({
              property: propName,
              defaults: defValue
            });
            view = new PropertyView({
              model
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          it('Value as default', () => {
            expect(view.model.get('value')).toEqual(defValue);
          });

          it('Placeholder as default', () => {
            expect(view.$input.attr('placeholder')).toEqual(defValue);
          });

          it('Input value is empty', () => {
            expect(view.$input.val()).toEqual(defValue);
          });

        });

    });
  }
};
