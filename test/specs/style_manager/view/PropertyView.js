var path = 'StyleManager/view/';
define([path + 'PropertyView', 'StyleManager/model/Property', 'DomComponents/model/Component'],
  function(PropertyView, Property, Component) {

    return {
      run : function(){

          describe('PropertyView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;

            before(function () {
              $fixtures  = $("#fixtures");
              $fixture   = $('<div class="cssrule-fixture"></div>');
            });

            beforeEach(function () {
              component = new Component();
              model = new Property();
              view = new PropertyView({
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
            });

            it('Rendered correctly', function() {
              var prop = view.el;
              $fixture.get(0).querySelector('.property').should.be.ok;
              prop.querySelector('.label').should.be.ok;
            });

            it('Rendered correctly', function() {
              var prop = view.el;
              $fixture.get(0).querySelector('.property').should.be.ok;
              prop.querySelector('.label').should.be.ok;
            });

        });
      }
    };

});