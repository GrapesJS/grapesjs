var path = 'StyleManager/view/';
define([path + 'PropertySelectView', 'StyleManager/model/Property', 'DomComponents/model/Component'],
  function(PropertySelectView, Property, Component) {

    return {
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
              delete component;
            });

            it('Rendered correctly', function() {
              var prop = view.el;
              $fixture.get(0).querySelector('.property').should.be.ok;
              prop.querySelector('.label').should.be.ok;
              prop.querySelector('.field').should.be.ok;
            });

            it('Select rendered', function() {
              var prop = view.el;
              prop.querySelector('select').should.be.ok;
            });

            it('Options rendered', function() {
              var select = view.el.querySelector('select');
              select.children.length.should.equal(options.length);
            });

            it('Options rendered correctly', function() {
              var select = view.el.querySelector('select');
              var children = select.children;
              children[0].value.should.equal(options[0].value);
              children[1].value.should.equal(options[1].value);
              children[0].textContent.should.equal(options[0].value);
              children[1].textContent.should.equal(options[1].name);
              children[0].getAttribute('style').should.equal(options[0].style);
              (children[1].getAttribute('style') == null).should.equal(true);
            });

            it('Input should exist', function() {
              view.$input.should.be.ok;
            });

            it('Input value is empty', function() {
              view.model.get('value').should.be.empty;
            });

            it('Update model on input change', function() {
              view.$input.val(propValue).trigger('change');
              view.model.get('value').should.equal(propValue);
            });

            it('Update input on value change', function() {
              view.model.set('value', propValue);
              view.$input.val().should.equal(propValue);
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
                view.model.get('value').should.equal(propValue);
                view.$input.val().should.equal(propValue);
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
                view.$input.val().should.equal('test2value');
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
                view.model.get('value').should.equal(defValue);
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
                view.$input.val().should.equal('');
              });

              it('Input value is as default', function() {
                view.$input.val().should.equal(defValue);
              });

            });

        });
      }
    };

});