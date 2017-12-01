const PropertyView = require('style_manager/view/PropertyView');
const Property = require('style_manager/model/Property');
const Editor = require('editor/model/Editor');
const DomComponents = require('dom_components');
const Component = require('dom_components/model/Component');

module.exports = {
  run() {

      describe('PropertyView', () => {

        let em;
        let dcomp;
        let compOpts;
        var component;
        var fixtures;
        var target;
        var model;
        var view;
        var propTarget;
        var options;
        var propName = 'testprop';
        var propValue = 'testvalue';
        var defValue = 'testDefault';

        beforeEach(() => {
          em = new Editor({});
          dcomp = new DomComponents();
          compOpts = { em, componentTypes: dcomp.componentTypes };
          propTarget = { ...Backbone.Events };
          target = new Component({}, compOpts);
          component = new Component({}, compOpts);
          model = new Property({property: propName});
          propTarget.model = component;
          options = {
            model,
            propTarget
          };
          view = new PropertyView(options);
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.firstChild;
          view.render();
          fixtures.appendChild(view.el);
        });

        afterEach(() => {
          //view.remove(); // strange errors ???
        });

        after(() => {
          component = null;
        });

        it('Rendered correctly', () => {
          var prop = view.el;
          expect(fixtures.querySelector('.property')).toExist();
          expect(prop.querySelector('.label')).toExist();
          expect(prop.querySelector('.field')).toExist();
        });

        it('Input should exist', () => {
          expect(view.getInputEl()).toExist();
        });

        it('Input value is empty', () => {
          expect(view.model.get('value')).toNotExist();
          expect(view.getInputValue()).toNotExist();
        });

        it('Model not change without update trigger', () => {
          view.getInputEl().value = propValue;
          expect(view.model.get('value')).toNotExist();
        });

        // Tests inputValueChanged()
        it('Update model on input change', () => {
          view.getInputEl().value = propValue;
          view.inputValueChanged();
          expect(view.model.get('value')).toEqual(propValue);
        });

        // Tests modelValueChanged() -> ...
        it('Update input on value change', () => {
          view.model.set('value', propValue);
          expect(view.getInputValue()).toEqual(propValue);
        });

        it('Update target on value change', () => {
          view.model.set('value', propValue);
          var compStyle = view.getTargetModel().get('style');
          var assertStyle = {};
          assertStyle[propName] = propValue;
          expect(compStyle).toEqual(assertStyle);
        });

        it('Update target on value change with functionName', () => {
          view.model.set('functionName', 'testfunc');
          view.model.set('value', propValue);
          var compStyle = view.getTargetModel().get('style');
          var assertStyle = {};
          assertStyle[propName] = 'testfunc(' + propValue + ')';
          expect(compStyle).toEqual(assertStyle);
        });

        it('Clean target from the property if its value is empty', () => {
          view.model.set('value', propValue);
          view.model.set('value', '');
          var compStyle = view.getTargetModel().get('style');
          expect(compStyle).toEqual({});
        });

        it('Check stylable element', () => {
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
          expect(view.getTargetValue()).toNotExist();
        });

        it('Target style is correct', () => {
          var style = {};
          style[propName] = propValue;
          component.set('style', style);
          expect(view.getTargetValue()).toEqual(propValue);
        });

        it('Target style is empty with an other style', () => {
          var style = {};
          style[propName + '2'] = propValue;
          component.set('style', style);
          expect(view.getTargetValue()).toNotExist();
        });

        it('Fetch value from function', () => {
          view.selectedComponent = component;
          const val = `testfun(${propValue})`;
          component.set('style', {[propName]: val});
          view.model.set('functionName', 'testfun');
          expect(view.getTargetValue()).toEqual(val);
        });

        describe('With target setted', () => {

          beforeEach(() => {
            target.model = component;
            view = new PropertyView({
              model,
              propTarget: target
            });
            fixtures.innerHTML = '';
            view.render();
            fixtures.appendChild(view.el);
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
            expect(view.getInputValue()).toEqual(propValue);
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
            expect(view.getInputValue()).toEqual(propValue + '2');
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
            fixtures.innerHTML = '';
            view.render();
            fixtures.appendChild(view.el);
          });

          it('Value as default', () => {
            expect(view.model.get('value')).toEqual(defValue);
          });

          it('Placeholder as default', () => {
            var input = view.getInputEl();
            expect(input.getAttribute('placeholder')).toEqual(defValue);
          });

          it('Input value is set up to default', () => {
            expect(view.getInputValue()).toEqual(defValue);
          });

        });

    });
  }
};
