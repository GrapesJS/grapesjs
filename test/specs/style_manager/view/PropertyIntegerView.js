const PropertyIntegerView = require('style_manager/view/PropertyIntegerView');
const Property = require('style_manager/model/Property');
const PropertyInteger = require('style_manager/model/PropertyInteger');
const Component = require('dom_components/model/Component');
const Editor = require('editor/model/Editor');
const DomComponents = require('dom_components');

module.exports = {
  run() {

      describe('PropertyIntegerView', () => {

        let em;
        let dcomp;
        let compOpts;
        var component;
        var fixtures;
        var target;
        var model;
        var view;
        var propTarget;
        var propName = 'testprop';
        var intValue = '55';
        var unitValue = 'px';
        var propValue = intValue + unitValue;
        var defValue = 'test2value';
        var units = ['px', '%', 'em'];
        var minValue = -15;
        var maxValue = 75;
        var unitsElSel = '.field-units select';

        beforeEach(() => {
          em = new Editor({});
          dcomp = new DomComponents();
          compOpts = { em, componentTypes: dcomp.componentTypes };
          propTarget = { ...Backbone.Events };
          target = new Component({}, compOpts);
          component = new Component({}, compOpts);
          model = new PropertyInteger({
            units,
            property: propName
          });
          propTarget.model = component;
          view = new PropertyIntegerView({
            model,
            propTarget
          });
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
          view = null;
          model = null;
        });

        it('Rendered correctly', () => {
          var prop = view.el;
          expect(fixtures.querySelector('.property')).toExist();
          expect(prop.querySelector('.label')).toExist();
          expect(prop.querySelector('.field')).toExist();
        });

        it('Inputs rendered', () => {
          var prop = view.el;
          expect(prop.querySelector('input[type=text]')).toExist();
          expect(prop.querySelector(unitsElSel)).toExist();
        });

        it('Units rendered', () => {
          var select = view.el.querySelector(unitsElSel);
          expect(select.children.length).toEqual(units.length);
        });

        it('Units rendered correctly', () => {
          var children = view.el.querySelector(unitsElSel).children;
          expect(children[0].textContent).toEqual(units[0]);
          expect(children[1].textContent).toEqual(units[1]);
          expect(children[2].textContent).toEqual(units[2]);
        });

        it('Inputs should exist', () => {
          expect(view.input).toExist();
          expect(view.unit).toExist();
        });

        it('Input value is empty', () => {
          expect(view.model.get('value')).toNotExist();
        });

        it('Update model on setValue', () => {
          view.setValue(intValue + unitValue);
          expect(view.model.get('value')).toEqual(parseFloat(intValue));
          expect(view.model.get('unit')).toEqual(unitValue);
          expect(view.getInputValue()).toEqual(intValue);
          expect(view.unit.value).toEqual(unitValue);
        });

        it('Update model on input change', () => {
          view.$input.val(123).trigger('change');
          expect(view.model.get('value')).toEqual(123);
        });

        it('Update model on unit change', () => {
          view.$unit.val(units[1]).trigger('change');
          expect(view.model.get('unit')).toEqual(units[1]);
        });

        it('Update input on value change', () => {
          view.model.set('value', intValue);
          expect(view.getInputValue()).toEqual(intValue);
        });

        it('Update target on value change', () => {
          const val = `${intValue}%`;
          view.model.setValue(val);
          expect(view.getTargetValue()).toEqual(val);
        });

        describe('With target setted', () => {

          beforeEach(() => {
            target.model = component;
            view = new PropertyIntegerView({
              model,
              propTarget: target
            });
            fixtures.innerHTML = '';
            view.render();
            fixtures.appendChild(view.el);
          });

          it('Update value and input on target swap', () => {
            var style = {};
            style[propName] = propValue;
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual(parseFloat(intValue));
            expect(view.getInputValue()).toEqual(intValue);
          });

          it('Update value after multiple swaps', () => {
            var style = {};
            style[propName] = propValue;
            component.set('style', style);
            view.propTarget.trigger('update');
            style[propName] = '20em';
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual(20);
            expect(view.model.get('unit')).toEqual('em');
            expect(view.getInputValue()).toEqual('20');
            expect(view.$unit.val()).toEqual('em');
          });

        })

        describe('Init property', () => {

          beforeEach(() => {
            component = new Component();
            model = new PropertyInteger({
              units,
              property: propName,
              defaults: intValue,
              min: minValue,
              max: maxValue,
              unit: units[1],
            });
            view = new PropertyIntegerView({
              model
            });
            fixtures.innerHTML = '';
            view.render();
            fixtures.appendChild(view.el);
          });

          it('Value as default', () => {
            expect(view.model.get('value')).toEqual(parseInt(intValue));
            expect(view.model.get('unit')).toEqual(units[1]);
          });

          it('Input value is as default', () => {
            expect(view.getInputValue()).toEqual(intValue);
            expect(view.$unit.val()).toEqual(units[1]);
          });

          it('Input follows min', () => {
            view.$input.val(minValue - 50).trigger('change');
            expect(view.model.get('value')).toEqual(minValue);
            expect(view.getInputValue()).toEqual(minValue + "");
          });

          it('Input follows max', () => {
            view.$input.val(maxValue + 50).trigger('change');
            expect(view.model.get('value')).toEqual(maxValue);
            expect(view.getInputValue()).toEqual(maxValue + "");
          });

        });

    });
  }
};
