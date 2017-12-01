const PropertyColorView = require('style_manager/view/PropertyColorView');
const Property = require('style_manager/model/Property');
const Component = require('dom_components/model/Component');
const Editor = require('editor/model/Editor');
const DomComponents = require('dom_components');

module.exports = {
  run() {

      describe('PropertyColorView', () => {

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
        var propValue = '#fff';
        var defValue = 'test2value';

        before(() => {
          $.fn.spectrum = function() {return this};
        });

        beforeEach(() => {
          em = new Editor({});
          dcomp = new DomComponents();
          compOpts = { em, componentTypes: dcomp.componentTypes };
          propTarget = { ...Backbone.Events };
          target = new Component({}, compOpts);
          component = new Component({}, compOpts);
          model = new Property({
            type: 'color',
            property: propName
          });
          propTarget.model = component;
          view = new PropertyColorView({
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
        });

        it('Inputs should exist', () => {
          expect(view.$input).toExist();
          expect(view.$color).toExist();
        });

        it('Input value is empty', () => {
          expect(view.model.get('value')).toNotExist();
          expect(view.getInputValue()).toNotExist();
        });

        it('Update model on setValue', () => {
          view.setValue(propValue);
          expect(view.getInputValue()).toEqual(propValue);
        });

        it('Update model on input change', () => {
          view.getInputEl().value = propValue;
          view.inputValueChanged();
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
            fixtures.innerHTML = '';
            view.render();
            fixtures.appendChild(view.el);
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
            fixtures.innerHTML = '';
            view.render();
            fixtures.appendChild(view.el);
          });

          it('Value as default', () => {
            expect(view.model.get('value')).toEqual(propValue);
          });

          it('Input value is the default', () => {
            expect(view.getInputValue()).toEqual(propValue);
          });

        });

    });
  }
};
