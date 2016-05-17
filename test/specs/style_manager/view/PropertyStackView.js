var path = 'StyleManager/view/';
define([path + 'PropertyStackView', 'StyleManager/model/Property', 'DomComponents/model/Component'],
  function(PropertyStackView, Property, Component) {

    return {
      run : function(){

          describe('PropertyStackView', function() {

            var component;
            var $fixtures;
            var $fixture;
            var target;
            var model;
            var view;
            var propName = 'testprop';
            var propValue = 'test1value';
            var defValue = 'test2value';
            var layers = [
              {value: 'lval1'},
              {value: 'lval2 lval22'},
              {value: 'lval3 lval32 lval33'}
            ];
            var properties = [
              {property: 'subprop1'},
              {
                type: 'integer',
                property: 'subprop2',
                defaults: 0,
                units: ['%', 'px']
              },
              {
                type: 'select',
                property: 'subprop3',
                defaults: 'val2',
                list: [
                  {value:'val1'},
                  {value:'val2'},
                  {value:'val3'},
                ]
              },
            ];

            before(function () {
              $fixtures  = $("#fixtures");
              $fixture   = $('<div class="sm-fixture"></div>');
            });

            beforeEach(function () {
              target = new Component();
              component = new Component();
              target.model = component;
              model = new Property({
                type: 'stack',
                property: propName,
                properties: properties
              });
              view = new PropertyStackView({
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
              prop.querySelector('#add').should.be.ok;
            });

            it('Layers rendered', function() {
              view.el.querySelector('.layers').should.be.ok;
            });

            it('Layers should exist', function() {
              view.$props.should.be.ok;
            });

            it('Layers rendered correctly', function() {
              var children = view.$props.get(0).children;
              children.length.should.equal(properties.length + 1);
              children[0].id.should.equal(properties[0].property);
              children[1].id.should.equal(properties[1].property);
              children[2].id.should.equal(properties[2].property);
            });

            it('Input value is empty', function() {
              view.model.get('value').should.be.empty;
            });

            it('Layers container is empty', function() {
              var layers = view.el.querySelector('.layers');
              layers.innerHTML.should.be.empty;
            });

            describe('With layers', function() {

              beforeEach(function () {
                model = new Property({
                  type: 'stack',
                  property: propName,
                  properties: properties,
                });
                view = new PropertyStackView({
                  model: model,
                  propTarget: target
                });
                $fixture.empty().appendTo($fixtures);
                $fixture.html(view.render().el);
                model.get('layers').add(layers);
              });

              it('Layers inserted', function() {
                view.getLayers().length.should.equal(layers.length);
              });

              it('Get value on index', function() {
                view.model.set('stackIndex', 1);
                view.valueOnIndex(1).should.equal('lval22');
              });

              it('createValue merges layers', function() {
                view.createValue().should.equal('lval1, lval2 lval22, lval3 lval32 lval33');
              });

              it('Add layer', function() {
                view.addLayer();
                view.getLayers().length.should.equal(layers.length+1);
              });

            });

            describe('With target setted', function() {

              var prop2Val;
              var prop3Val;
              var prop2Unit;
              var finalResult;
              var $prop1;
              var $prop2;
              var $prop3;

              beforeEach(function () {
                model = new Property({
                  type: 'stack',
                  property: propName,
                  properties: properties
                });
                view = new PropertyStackView({
                  model: model,
                  propTarget: target
                });
                $fixture.empty().appendTo($fixtures);
                $fixture.html(view.render().el);
                prop3Val = properties[2].list[2].value;
                prop2Val = properties[1].defaults;
                prop2Unit = properties[1].units[0];
                finalResult = propValue + ' ' + prop2Val + prop2Unit +' ' + prop3Val;
                $prop1 = view.$props.find('#' + properties[0].property + ' input');
                $prop2 = view.$props.find('#' + properties[1].property + ' input');
                $prop3 = view.$props.find('#' + properties[2].property + ' select');
              });

              it('Update model on input change', function() {
                $prop1.val(propValue).trigger('change');
                $prop3.val(prop3Val).trigger('change');
                view.model.get('value').should.equal(finalResult);
              });

              it('Update value on models change', function() {
                view.model.get('properties').at(0).set('value', propValue);
                view.model.get('properties').at(2).set('value', prop3Val);
                view.model.get('value').should.equal(finalResult);
              });

              it('Update target on value change', function() {
                $prop1.val(propValue).trigger('change');
                var compStyle = view.getTarget().get('style');
                var assertStyle = {};
                assertStyle[propName] = propValue + ' 0% val2';
                compStyle.should.deep.equal(assertStyle);
              });

              it('Update target on detached value change', function() {
                model = new Property({
                  type: 'stack',
                  property: propName,
                  properties: properties,
                  detached: true,
                });
                view = new PropertyStackView({
                  model: model,
                  propTarget: target
                });
                $fixture.html(view.render().el);
                $prop1 = view.$props.find('#' + properties[0].property + ' input');
                $prop1.val(propValue).trigger('change');
                var compStyle = view.getTarget().get('style');
                var assertStyle = {};
                assertStyle[properties[0].property] = $prop1.val();
                compStyle.should.deep.equal(assertStyle);
              });

              it('Update value and input on target swap', function() {
                var style = {};
                style[propName] = finalResult;
                component.set('style', style);
                view.propTarget.trigger('update');
                $prop1.val().should.equal(propValue);
                $prop3.val().should.equal(prop3Val);
              });

              it('Update value after multiple swaps', function() {
                var style = {};
                style[propName] = finalResult;
                component.set('style', style);
                view.propTarget.trigger('update');
                style[propName] = propValue + '2 ' + prop2Val + '2' + prop2Unit + ' ' + 'val1';
                component.set('style', style);
                view.propTarget.trigger('update');
                $prop1.val().should.equal(propValue + '2');
                $prop2.val().should.equal('2');
                $prop3.val().should.equal('val1');
              });

              it('The value is correctly extracted from the composite string', function() {
                var style = {};
                style[propName] = 'value1 value2 value3 value4';
                component.set('style', style);
                view.valueOnIndex(2).should.equal('value3');
                view.valueOnIndex(0).should.equal('value1');
                (view.valueOnIndex(4) === null).should.equal(true);
              });

              it('Build value from properties', function() {
                view.model.get('properties').at(0).set('value', propValue);
                view.model.get('properties').at(2).set('value', prop3Val);
                view.build().should.equal(finalResult);
              });

            })

            describe('Init property', function() {

              beforeEach(function () {
                model = new Property({
                  type: 'stack',
                  property: propName,
                  properties: properties,
                  defaults: defValue,
                });
                view = new PropertyStackView({
                  model: model
                });
                $fixture.empty().appendTo($fixtures);
                $fixture.html(view.render().el);
              });

              it('Value as default', function() {
                view.model.get('value').should.equal(defValue);
              });

            });

        });
      }
    };

});