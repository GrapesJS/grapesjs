var path = 'StyleManager/view/';
define([path + 'PropertyRadioView', 'StyleManager/model/Property', 'DomComponents/model/Component'],
  function(PropertyRadioView, Property, Component) {

    return {
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
              delete component;
            });

            it('Rendered correctly', function() {
              var prop = view.el;
              $fixture.get(0).querySelector('.property').should.be.ok;
              prop.querySelector('.label').should.be.ok;
              prop.querySelector('.field').should.be.ok;
            });

            it('Radio rendered', function() {
              var prop = view.el;
              prop.querySelector('input[type=radio]').should.be.ok;
            });

            it('Options rendered', function() {
              var input = view.el.querySelector('#input-holder');
              input.children.length.should.equal(options.length);
            });

            it('Options rendered correctly', function() {
              var children = view.el.querySelector('#input-holder').children;
              children[0].querySelector('label').textContent.should.equal('test1value');
              children[1].querySelector('label').textContent.should.equal('test2');
              children[0].querySelector('input').value.should.equal(options[0].value);
              children[1].querySelector('input').value.should.equal(options[1].value);
              children[0].querySelector('label').getAttribute('title').should.equal(options[0].title);
              (children[1].querySelector('label').getAttribute('title') == null)
                .should.equal(true);
            });

            it('Input should exist', function() {
              view.$input.should.be.ok;
            });

            it('Input value is empty', function() {
              view.model.get('value').should.be.empty;
            });

            it('Update model on input change', function() {
              view.setValue(propValue);
              view.model.get('value').should.equal(propValue);
              view.getInputValue().should.equal(propValue);
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
                view.model.get('value').should.equal(propValue);
                view.getInputValue().should.equal(propValue);
              });

              it('Update value after multiple swaps', function() {
                var style = {};
                style[propName] = propValue;
                component.set('style', style);
                view.propTarget.trigger('update');
                style[propName] = 'test2value';
                component.set('style', style);
                view.propTarget.trigger('update');
                view.model.get('value').should.equal('test2value');
                view.getInputValue().should.equal('test2value');
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
                view.model.get('value').should.equal(defValue);
              });

              it('Input value is as default', function() {
                view.getInputValue().should.equal(defValue);
              });

            });

        });
      }
    };

});