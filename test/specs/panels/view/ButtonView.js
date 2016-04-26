var path = 'Panels/view/';
define([path + 'ButtonView', 'Panels/model/Button'],
  function(ButtonView, Button) {

    return {
      run : function(){

          describe('ButtonView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;
            var btnClass = 'btn';

            before(function () {
              $fixtures  = $("#fixtures");
              $fixture   = $('<div class="cssrule-fixture"></div>');
            });

            beforeEach(function () {
              model = new Button();
              view = new ButtonView({
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

            it('Button empty', function() {
              $fixture.html().should.be.equal('<span class="' + btnClass+ '"></span>');
            });

            it('Update class', function() {
              model.set('className','test');
              view.el.getAttribute('class').should.be.equal(btnClass + ' test');
            });

            it('Update attributes', function() {
              model.set('attributes',{
                'data-test': 'test-value'
              });
              view.el.getAttribute('data-test').should.be.equal('test-value');
            });

            it('Check enable active', function() {
              model.set('active', true, {silent: true});
              view.checkActive();
              view.el.getAttribute('class').should.be.equal(btnClass + ' active');
            });

            it('Check disable active', function() {
              model.set('active', true, {silent: true});
              view.checkActive();
              model.set('active', false, {silent: true});
              view.checkActive();
              view.el.getAttribute('class').should.be.equal(btnClass);
            });

            it('Renders correctly', function() {
              view.render().should.be.ok;
            });

        });
      }
    };

});