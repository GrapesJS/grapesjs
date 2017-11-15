const PropertySelectView = require('style_manager/view/PropertySelectView');
const Property = require('style_manager/model/Property');
const Editor = require('editor/model/Editor');
const DomComponents = require('dom_components');
const Component = require('dom_components/model/Component');

module.exports = {
  run() {

      describe('PropertySelectView', () => {

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
        var propValue = 'test1value';
        var defValue = 'test2value';
        var options = [
              {value: 'test1value', style: 'test:style'},
              {name: 'test2', value: 'test2value'}
            ];

        beforeEach(() => {
          em = new Editor({});
          dcomp = new DomComponents();
          compOpts = { em, componentTypes: dcomp.componentTypes };
          propTarget = { ...Backbone.Events };
          target = new Component({}, compOpts);
          component = new Component({}, compOpts);
          model = new Property({
            type: 'select',
            list: options,
            property: propName
          });
          propTarget.model = component;
          view = new PropertySelectView({
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
        });

        it('Rendered correctly', () => {
          var prop = view.el;
          expect(fixtures.querySelector('.property')).toExist();
          expect(prop.querySelector('.label')).toExist();
          expect(prop.querySelector('.field')).toExist();
        });

        it('Select rendered', () => {
          var prop = view.el;
          expect(prop.querySelector('select')).toExist();
        });

        it('Options rendered', () => {
          var select = view.el.querySelector('select');
          expect(select.children.length).toEqual(options.length);
        });

        it('Options rendered correctly', () => {
          var select = view.el.querySelector('select');
          var children = select.children;
          expect(children[0].value).toEqual(options[0].value);
          expect(children[1].value).toEqual(options[1].value);
          expect(children[0].textContent).toEqual(options[0].value);
          expect(children[1].textContent).toEqual(options[1].name);
          expect(children[0].getAttribute('style')).toEqual(options[0].style);
          expect(children[1].getAttribute('style')).toEqual(null);
        });

        it('Input should exist', () => {
          expect(view.input).toExist();
        });

        it('Input value is empty', () => {
          expect(view.model.get('value')).toNotExist();
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
            view = new PropertySelectView({
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
            style[propName] = 'test2value';
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual('test2value');
            expect(view.getInputValue()).toEqual('test2value');
          });

        })

        describe('Init property', () => {

          beforeEach(() => {
            component = new Component();
            model = new Property({
              type: 'select',
              list: options,
              defaults: defValue,
              property: propName
            });
            view = new PropertySelectView({
              model
            });
            fixtures.innerHTML = '';
            view.render();
            fixtures.appendChild(view.el);
          });

          it('Value as default', () => {
            expect(view.model.get('value')).toEqual(defValue);
          });

          it('Empty value as default', () => {
            options = [
                {value: '', name: 'test'},
                {value: 'test1value', name: 'test1'},
                {value: 'test2value', name: 'test2'},
                {value: '', name: 'TestDef'}
              ];
            component = new Component();
            model = new Property({
              type: 'select',
              list: options,
              defaults: '',
              property: 'emptyDefault'
            });
            view = new PropertySelectView({
              model
            });
            view.render();
            fixtures.innerHTML = '';
            fixtures.appendChild(view.el);
            expect(view.getInputValue()).toEqual('');
          });

          it('Input value is as default', () => {
            expect(view.model.getDefaultValue()).toEqual(defValue);
          });

        });

    });
  }
};
