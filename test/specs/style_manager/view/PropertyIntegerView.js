const PropertyIntegerView = require('style_manager/view/PropertyIntegerView');
const Property = require('style_manager/model/Property');
const Component = require('dom_components/model/Component');

module.exports = {
  run : function(){

      describe('PropertyIntegerView', function() {

        var component;
        var $fixtures;
        var $fixture;
        var target;
        var model;
        var view;
        var propName = 'testprop';
        var intValue = '55';
        var unitValue = 'px';
        var propValue = intValue + unitValue;
        var defValue = 'test2value';
        var units = ['px', '%', 'em'];
        var minValue = -15;
        var maxValue = 75;
        var unitsElSel = '.field-units select';

        before(function () {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="sm-fixture"></div>');
        });

        beforeEach(function () {
          target = new Component();
          component = new Component();
          model = new Property({
            type: 'integer',
            units: units,
            property: propName
          });
          view = new PropertyIntegerView({
            model: model
          });
          $fixture.empty().appendTo($fixtures);
          $fixture.html(view.render().el);
        });

        afterEach(function () {
          //view.remove(); // strange errors ???
        });

        after(function () {
          $fixture.remove();
          component = null;
          view = null;
          model = null;
        });

        it('Rendered correctly', function() {
          var prop = view.el;
          expect($fixture.get(0).querySelector('.property')).toExist();
          expect(prop.querySelector('.label')).toExist();
          expect(prop.querySelector('.field')).toExist();
        });

        it('Inputs rendered', function() {
          var prop = view.el;
          expect(prop.querySelector('input[type=text]')).toExist();
          expect(prop.querySelector(unitsElSel)).toExist();
        });

        it('Units rendered', function() {
          var select = view.el.querySelector(unitsElSel);
          expect(select.children.length).toEqual(units.length);
        });

        it('Units rendered correctly', function() {
          var children = view.el.querySelector(unitsElSel).children;
          expect(children[0].textContent).toEqual(units[0]);
          expect(children[1].textContent).toEqual(units[1]);
          expect(children[2].textContent).toEqual(units[2]);
        });

        it('Inputs should exist', function() {
          expect(view.$input).toExist();
          expect(view.$unit).toExist();
        });

        it('Input value is empty', function() {
          expect(view.model.get('value')).toNotExist();
          expect(view.model.get('unit')).toEqual('px');
        });

        it('Update model on setValue', function() {
          view.setValue(intValue + unitValue);
          expect(view.model.get('value')).toEqual(parseFloat(intValue));
          expect(view.model.get('unit')).toEqual(unitValue);
          expect(view.$input.val()).toEqual(intValue);
          expect(view.$unit.val()).toEqual(unitValue);
        });

        it('Update model on input change', function() {
          view.$input.val(123).trigger('change');
          expect(view.model.get('value')).toEqual(123);
        });

        it('Update model on unit change', function() {
          view.$unit.val(units[1]).trigger('change');
          expect(view.model.get('unit')).toEqual(units[1]);
        });

        it('Update input on value change', function() {
          view.model.set('value', intValue);
          expect(view.getInputValue()).toEqual(intValue);
        });

        it('Update target on value change', function() {
          view.selectedComponent = component;
          view.model.set('value', intValue);
          var compStyle = view.selectedComponent.get('style');
          var assertStyle = {};
          assertStyle[propName] = propValue;
          expect(compStyle).toEqual(assertStyle);
        });

        describe('With target setted', function() {

          beforeEach(function () {
            target.model = component;
            view = new PropertyIntegerView({
              model: model,
              propTarget: target
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          it('Update value and input on target swap', function() {
            var style = {};
            style[propName] = propValue;
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual(parseFloat(intValue));
            expect(view.getInputValue()).toEqual(intValue);
          });

          it('Update value after multiple swaps', function() {
            var style = {};
            style[propName] = propValue;
            component.set('style', style);
            view.propTarget.trigger('update');
            style[propName] = '20em';
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual(20);
            expect(view.model.get('unit')).toEqual('em');
            expect(view.$input.val()).toEqual('20');
            expect(view.$unit.val()).toEqual('em');
          });

        })

        describe('Init property', function() {

          beforeEach(function () {
            component = new Component();
            model = new Property({
              type: 'integer',
              units: units,
              property: propName,
              defaults: intValue,
              min: minValue,
              max: maxValue,
              unit: units[1],
            });
            view = new PropertyIntegerView({
              model: model
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          it('Value as default', function() {
            expect(view.model.get('value')).toEqual(parseInt(intValue));
            expect(view.model.get('unit')).toEqual(units[1]);
          });

          it('Input value is as default', function() {
            expect(view.$input.val()).toEqual(intValue);
            expect(view.$unit.val()).toEqual(units[1]);
          });

          it('Input follows min', function() {
            view.$input.val(minValue - 50).trigger('change');
            expect(view.model.get('value')).toEqual(minValue);
            expect(view.$input.val()).toEqual(minValue + "");
          });

          it('Input follows max', function() {
            view.$input.val(maxValue + 50).trigger('change');
            expect(view.model.get('value')).toEqual(maxValue);
            expect(view.$input.val()).toEqual(maxValue + "");
          });

        });

    });
  }
};
