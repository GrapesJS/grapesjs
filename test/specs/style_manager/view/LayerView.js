var path = 'StyleManager/view/';
define([path + 'LayerView', 'StyleManager/model/Layers'],
  function(LayerView, Layers) {

    return {
      run : function(){

          describe('LayerView', function() {

            var component;
            var $fixtures;
            var $fixture;
            var target;
            var model;
            var view;

            before(function () {
              $fixtures  = $("#fixtures");
              $fixture   = $('<div class="layer-fixture"></div>');
            });

            beforeEach(function () {
              var coll = new Layers();
              model = coll.add({});
              view = new LayerView({
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
              delete component;
              delete view;
              delete model;
            });

            it('Rendered correctly', function() {
              var layer = view.el;
              $fixture.get(0).querySelector('.layer').should.be.ok;
              layer.querySelector('#label').should.be.ok;
              layer.querySelector('#close-layer').should.be.ok;
              layer.querySelector('#inputs').should.be.ok;
              layer.querySelector('#inputs').innerHTML.should.be.empty;
              layer.querySelector('#preview').should.be.ok;
            });

            it('getIndex returns default value', function() {
              view.getIndex().should.equal(0);
            });

            it('No preview', function() {
              var style = view.el.querySelector('#preview').style;
              style.cssText.should.be.empty;
            });

            it('Changes on value trigger onPreview', function() {
              var called = 0;
              view.onPreview = function(){called = 1};
              view.model.set('preview', true);
              view.model.set('value', 'test');
              called.should.equal(1);
            });

            it('Update props', function() {
              view.model.set('props', $('<div>'));
              view.el.querySelector('#inputs').innerHTML.should.not.be.empty;
              (view.model.get('props') === null).should.equal(true);
            });

        });
      }
    };

});