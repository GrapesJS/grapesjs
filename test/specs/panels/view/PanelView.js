var path = 'Panels/view/';
define([path + 'PanelView', 'Panels/model/Panel'],
  function(PanelView, Panel) {

    return {
      run : function(){

          describe('PanelView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;

            before(function () {
              $fixtures  = $("#fixtures");
              $fixture   = $('<div class="cssrule-fixture"></div>');
            });

            beforeEach(function () {
              model = new Panel();
              view = new PanelView({
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

            it('Panel empty', function() {
              $fixture.html().should.be.equal('<div class="panel"></div>');
            });

            it('Append content', function() {
              model.set('appendContent','test');
              model.set('appendContent','test2');
              view.$el.html().should.be.equal('testtest2');
            });

            it('Update content', function() {
              model.set('content','test');
              model.set('content','test2');
              view.$el.html().should.be.equal('test2');
            });

            describe('Init with options', function() {

              beforeEach(function () {
                model = new Panel({
                  buttons: [{}]
                });
                view = new PanelView({
                  model: model
                });
                $fixture.empty().appendTo($fixtures);
                $fixture.html(view.render().el);
              });

              afterEach(function () {
                view.remove();
              });

            });

        });
      }
    };

});