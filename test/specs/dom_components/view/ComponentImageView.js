var path = 'DomComponents/view/';
define([path + 'ComponentImageView', 'DomComponents/model/Component'],
  function(ComponentImageView, Component) {

    return {
      run : function(){

          describe('ComponentImageView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;

            before(function () {
              $fixtures = $("#fixtures");
              $fixture = $('<div class="components-fixture"></div>');
            });

            beforeEach(function () {
              model = new Component();
              view = new ComponentImageView({
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
              view.el.getAttribute('onmousedown').should.equal('return false');
              view.el.getAttribute('class').should.equal(view.classEmpty);
            });

            it('TagName is <img>', function() {
              view.el.tagName.should.equal('IMG');
            });

            it('Update src attribute', function() {
              model.set('src','./');
              view.el.getAttribute('src').should.equal('./');
            });

            it('Renders correctly', function() {
              view.render().should.be.ok;
            });
        });
      }
    };

});
