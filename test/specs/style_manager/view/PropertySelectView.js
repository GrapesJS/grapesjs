const PropertySelectView = require('style_manager/view/PropertySelectView');
const Property = require('style_manager/model/Property');
const Component = require('dom_components/model/Component');

module.exports = {
  run : function(){

      describe('PropertySelectView', function() {

        var component;
        var $fixtures;
        var $fixture;
        var target;
        var model;
        var view;
        var propName = 'testprop';
        var propValue = 'test1value';
        var defValue = 'test2value';
        var options = [
              {value: 'test1value', style: 'test:style'},
              {name: 'test2', value: 'test2value'}
            ];

        before(function () {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="sm-fixture"></div>');
        });

        beforeEach(function () {
          target = new Component();
          component = new Component();
          model = new Property({
            type: 'select',
            list: options,
            property: propName
          });
          view = new PropertySelectView({
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
        });

        it('Rendered correctly', function() {
          var prop = view.el;
          expect($fixture.get(0).querySelector('.property')).toExist();
          expect(prop.querySelector('.label')).toExist();
          expect(prop.querySelector('.field')).toExist();
        });

        it('Select rendered', function() {
          var prop = view.el;
          expect(prop.querySelector('select')).toExist();
        });

        it('Options rendered', function() {
          var select = view.el.querySelector('select');
          expect(select.children.length).toEqual(options.length);
        });

        it('Options rendered correctly', function() {
          var select = view.el.querySelector('select');
          var children = select.children;
          expect(children[0].value).toEqual(options[0].value);
          expect(children[1].value).toEqual(options[1].value);
          expect(children[0].textContent).toEqual(options[0].value);
          expect(children[1].textContent).toEqual(options[1].name);
          expect(children[0].getAttribute('style')).toEqual(options[0].style);
          expect(children[1].getAttribute('style')).toEqual(null);
        });

        it('Input should exist', function() {
          expect(view.$input).toExist();
        });

        it('Input value is empty', function() {
          expect(view.model.get('value')).toNotExist();
        });

        it('Update model on input change', function() {
          view.$input.val(propValue).trigger('change');
          expect(view.model.get('value')).toEqual(propValue);
        });

        it('Update input on value change', function() {
          view.model.set('value', propValue);
          expect(view.$input.val()).toEqual(propValue);
        });

        it('Update target on value change', function() {
          view.selectedComponent = component;
          view.model.set('value', propValue);
          var compStyle = view.selectedComponent.get('style');
          var assertStyle = {};
          assertStyle[propName] = propValue;
          expect(compStyle).toEqual(assertStyle);
        });

        describe('With target setted', function() {

          beforeEach(function () {
            target.model = component;
            view = new PropertySelectView({
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
            expect(view.model.get('value')).toEqual(propValue);
            expect(view.$input.val()).toEqual(propValue);
          });

          it('Update value after multiple swaps', function() {
            var style = {};
            style[propName] = propValue;
            component.set('style', style);
            view.propTarget.trigger('update');
            style[propName] = 'test2value';
            component.set('style', style);
            view.propTarget.trigger('update');
            expect(view.model.get('value')).toEqual('test2value');
            expect(view.$input.val()).toEqual('test2value');
          });

        })

        describe('Init property', function() {

          beforeEach(function () {
            component = new Component();
            model = new Property({
              type: 'select',
              list: options,
              defaults: defValue,
              property: propName
            });
            view = new PropertySelectView({
              model: model
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          it('Value as default', function() {
            expect(view.model.get('value')).toEqual(defValue);
          });

          it('Empty value as default', function() {
            options = [
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
              model: model
            });
            $fixture.html(view.render().el);
            expect(view.$input.val()).toEqual('');
          });

          it('Input value is as default', function() {
            expect(view.$input.val()).toEqual(defValue);
          });

        });

    });
  }
};
