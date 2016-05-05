var path = 'StyleManager/view/';
define([path + 'PropertyIntegerView', 'StyleManager/model/Property', 'DomComponents/model/Component'],
  function(PropertyIntegerView, Property, Component) {

    return {
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
              prop.querySelector('select.unit').should.be.ok;
            });

            it('Units rendered', function() {
              var select = view.el.querySelector('select.unit');
              select.children.length.should.equal(units.length);
            });

            it('Units rendered correctly', function() {
              var children = view.el.querySelector('select.unit').children;
              children[0].textContent.should.equal(units[0]);
              children[1].textContent.should.equal(units[1]);
              children[2].textContent.should.equal(units[2]);
            });

            it('Inputs should exist', function() {
              view.$input.should.be.ok;
              view.$unit.should.be.ok;
            });

            it('Input value is empty', function() {
              view.model.get('value').should.be.empty;
              view.model.get('unit').should.equal('px');
            });

            it('Update model on input change', function() {
              view.setValue(intValue + unitValue);
              view.model.get('value').should.equal(parseFloat(intValue));
              view.model.get('unit').should.equal(unitValue);
              view.$input.val().should.equal(intValue);
              view.$unit.val().should.equal(unitValue);
            });

            it('Update input on value change', function() {
              view.model.set('value', intValue);
              view.getInputValue().should.equal(intValue);
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
                view.model.get('value').should.equal(parseFloat(intValue));
                view.getInputValue().should.equal(intValue);
              });

              it('Update value after multiple swaps', function() {
                var style = {};
                style[propName] = propValue;
                component.set('style', style);
                view.propTarget.trigger('update');
                style[propName] = '20em';
                component.set('style', style);
                view.propTarget.trigger('update');
                view.model.get('value').should.equal(20);
                view.model.get('unit').should.equal('em');
                view.$input.val().should.equal('20');
                view.$unit.val().should.equal('em');
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
                  unit: units[1],
                });
                view = new PropertyIntegerView({
                  model: model
                });
                $fixture.empty().appendTo($fixtures);
                $fixture.html(view.render().el);
              });

              it('Value as default', function() {
                view.model.get('value').should.equal(intValue);
                view.model.get('unit').should.equal(units[1]);
              });

              it('Input value is as default', function() {
                view.$input.val().should.equal(intValue);
                view.$unit.val().should.equal(units[1]);
              });

            });

        });
      }
    };

});