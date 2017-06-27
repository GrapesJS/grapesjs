const PropertyRadioView = require('style_manager/view/PropertyRadioView');
const Property = require('style_manager/model/Property');
const Component = require('dom_components/model/Component');

module.exports = {
  run : function(){

      describe('PropertyRadioView', function() {

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
              { value: 'test1value', 'title': 'testtitle'},
              { name: 'test2', value: 'test2value'}
            ];

        before(function () {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="sm-fixture"></div>');
        });

        beforeEach(function () {
          target = new Component();
          component = new Component();
          model = new Property({
            type: 'radio',
            list: options,
            property: propName
          });
          view = new PropertyRadioView({
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

        it('Radio rendered', function() {
          var prop = view.el;
          expect(prop.querySelector('input[type=radio]')).toExist();
        });

        it('Options rendered', function() {
          var input = view.el.querySelector('#input-holder');
          expect(input.children.length).toEqual(options.length);
        });

        it('Options rendered correctly', function() {
          var children = view.el.querySelector('#input-holder').children;
          expect(children[0].querySelector('label').textContent).toEqual('test1value');
          expect(children[1].querySelector('label').textContent).toEqual('test2');
          expect(children[0].querySelector('input').value).toEqual(options[0].value);
          expect(children[1].querySelector('input').value).toEqual(options[1].value);
          expect(children[0].querySelector('label').getAttribute('title')).toEqual(options[0].title);
          expect(children[1].querySelector('label').getAttribute('title')).toEqual(null);
        });

        it('Input should exist', function() {
          expect(view.$input).toExist();
        });

        it('Input value is empty', function() {
          expect(view.model.get('value')).toNotExist();
        });

        it('Update model on input change', function() {
          view.setValue(propValue);
          expect(view.model.get('value')).toEqual(propValue);
          expect(view.getInputValue()).toEqual(propValue);
        });

        it('Update input on value change', function() {
          view.model.set('value', propValue);
          expect(view.getInputValue()).toEqual(propValue);
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
            view = new PropertyRadioView({
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
            expect(view.getInputValue()).toEqual(propValue);
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
            expect(view.getInputValue()).toEqual('test2value');
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
            view = new PropertyRadioView({
              model: model
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          it('Value as default', function() {
            expect(view.model.get('value')).toEqual(defValue);
          });

          it('Input value is as default', function() {
            expect(view.getInputValue()).toEqual(defValue);
          });

        });

    });
  }
};
