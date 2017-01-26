var path = 'StyleManager/view/';
define([path + 'PropertyColorView', 'StyleManager/model/Property', 'DomComponents/model/Component'],
  function(PropertyColorView, Property, Component) {

    return {
      run : function(){

          describe('PropertyColorView', function() {

            var component;
            var $fixtures;
            var $fixture;
            var target;
            var model;
            var view;
            var propName = 'testprop';
            var propValue = '#fff';
            var defValue = 'test2value';

            before(function () {
              $.fn.spectrum = function(){};
              $fixtures  = $("#fixtures");
              $fixture   = $('<div class="sm-fixture"></div>');
            });

            beforeEach(function () {
              target = new Component();
              component = new Component();
              model = new Property({
                type: 'color',
                property: propName
              });
              view = new PropertyColorView({
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
              delete component;
              delete view;
              delete model;
            });

            it('Rendered correctly', function() {
              var prop = view.el;
              $fixture.get(0).querySelector('.property').should.be.ok;
              prop.querySelector('.label').should.be.ok;
              prop.querySelector('.field').should.be.ok;
            });

            it('Inputs rendered', function() {
              var prop = view.el;
              prop.querySelector('input[type=text]').should.be.ok;
              prop.querySelector('.field-color-picker').should.be.ok;
            });

            it('Inputs should exist', function() {
              view.$input.should.be.ok;
              view.$color.should.be.ok;
            });

            it('Input value is empty', function() {
              view.model.get('value').should.be.empty;
              view.$input.val().should.be.empty;
            });

            it('Update model on setValue', function() {
              view.setValue(propValue);
              view.model.get('value').should.equal(propValue);
              view.$input.val().should.equal(propValue);
            });

            it('Update model on input change', function() {
              view.$input.val(propValue).trigger('change');
              view.model.get('value').should.equal(propValue);
            });

            it('Update input on value change', function() {
              view.model.set('value', propValue);
              view.getInputValue().should.equal(propValue);
            });

            it('Update target on value change', function() {
              view.selectedComponent = component;
              view.model.set('value', propValue);
              var compStyle = view.selectedComponent.get('style');
              var assertStyle = {};
              assertStyle[propName] = propValue;
              compStyle.should.deep.equal(assertStyle);
            });

            describe('With target setted', function() {

              beforeEach(function () {
                target.model = component;
                view = new PropertyColorView({
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
                view.model.get('value').should.equal(propValue);
                view.getInputValue().should.equal(propValue);
              });

              it('Update value after multiple swaps', function() {
                var style = {};
                style[propName] = propValue;
                component.set('style', style);
                view.propTarget.trigger('update');
                style[propName] = '#123123';
                component.set('style', style);
                view.propTarget.trigger('update');
                view.model.get('value').should.equal('#123123');
                view.$input.val().should.equal('#123123');
              });

            })

            describe('Init property', function() {

              beforeEach(function () {
                component = new Component();
                model = new Property({
                  type: 'color',
                  property: propName,
                  defaults: propValue,
                });
                view = new PropertyColorView({
                  model: model
                });
                $fixture.empty().appendTo($fixtures);
                $fixture.html(view.render().el);
              });

              it('Value as default', function() {
                view.model.get('value').should.equal(propValue);
              });

              it('Input value is as default', function() {
                view.$input.val().should.equal(propValue);
              });

            });

        });
      }
    };

});
