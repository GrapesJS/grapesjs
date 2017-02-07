var path = 'DomComponents/view/';
define([path + 'ComponentView', 'DomComponents/model/Component', 'DomComponents'],
  function(ComponentView, Component, DomComponents) {

    return {
      run : function(){

          describe('ComponentView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;
            var hClass = 'hc-state';
            var dcomp;
            var compOpts;

            before(function () {
              $fixtures = $("#fixtures");
              $fixture = $('<div class="components-fixture"></div>');
            });

            beforeEach(function () {
              dcomp = new DomComponents();
              compOpts = {
                defaultTypes: dcomp.componentTypes,
              };
              model = new Component();
              view = new ComponentView({
                model: model
              });
              $fixture.empty().appendTo($fixtures);
              $fixture.html(view.render().el);
            });

            afterEach(function () {
              view.remove();
            });

            after(function () {
              $fixture.remove();
            });

            it('Component empty', function() {
              $fixture.html().should.equal('<div></div>');
            });

            it('Add helper class on update of state', function() {
              model.set('state', 'test');
              $fixture.html().should.equal('<div class="' + hClass + '"></div>');
            });

            it('Clean form helper state', function() {
              model.set('state', 'test');
              model.set('state', '');
              $fixture.html().should.equal('<div class=""></div>');
            });

            it('Add helper class on status update', function() {
              model.set('status', 'selected');
              $fixture.html().should.equal('<div class="selected"></div>');
            });

            it('Get string of classes', function() {
              model.set('attributes', { class: ['test', 'test2']});
              view.getClasses().should.equal('test test2');
            });

            it('Update attributes', function() {
              model.set('attributes', {
                title: 'value',
                'data-test': 'value2',
              });
              view.el.getAttribute('title').should.equal('value');
              view.el.getAttribute('data-test').should.equal('value2');
            });

            it('Update style', function() {
              model.set('style', {
                color: 'red',
                float: 'left'
              });
              view.el.getAttribute('style').should.equal('color:red;float:left;');
            });

            it('Clean style', function() {
              model.set('style', { color: 'red'});
              model.set('style', {});
              view.el.getAttribute('style').should.equal('');
            });

            it('Get style string', function() {
              model.set('style',  {
                color: 'red',
                float: 'left'
              });
              view.getStyleString().should.equal('color:red;float:left;');
            });

            it('Add class', function() {
              model.get('classes').add({name: 'test'});
               view.el.getAttribute('class').should.equal('test');
            });

            it('Add classes', function() {
              model.get('classes').add([{name: 'test'}, {name: 'test2'}]);
              view.el.getAttribute('class').should.equal('test test2');
            });

            it('Update on remove of some class', function() {
              var cls1 = model.get('classes').add({name: 'test'});
              var cls12 = model.get('classes').add({name: 'test2'});
              model.get('classes').remove(cls1);
              view.el.getAttribute('class').should.equal('test2');
            });

            it('Init with different tag', function() {
              model = new Component({ tagName: 'span' });
              view = new ComponentView({ model: model });
              view.render().el.tagName.should.equal('SPAN');
            });

            it('Init with nested components', function() {
              model = new Component({
                components: [
                  { tagName: 'span'},
                  { attributes: { title: 'test'}}
                ]
              }, compOpts);
              view = new ComponentView({
                model: model,
                defaultTypes: dcomp.componentTypes,
              });
              view.render().$el.html().should.equal('<span></span><div title="test"></div>');
            });

        });
      }
    };

});
