const PanelView = require('panels/view/PanelView');
const Panel = require('panels/model/Panel');

module.exports = {
  run() {

      describe('PanelView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;

        before(() => {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="cssrule-fixture"></div>');
        });

        beforeEach(() => {
          model = new Panel();
          view = new PanelView({
            model
          });
          $fixture.empty().appendTo($fixtures);
          $fixture.html(view.render().el);
        });

        afterEach(() => {
          view.remove();
        });

        after(() => {
          $fixture.remove();
        });

        it('Panel empty', () => {
          expect($fixture.html()).toEqual('<div class="panel"></div>');
        });

        it('Append content', () => {
          model.set('appendContent','test');
          model.set('appendContent','test2');
          expect(view.$el.html()).toEqual('testtest2');
        });

        it('Update content', () => {
          model.set('content','test');
          model.set('content','test2');
          expect(view.$el.html()).toEqual('test2');
        });

        describe('Init with options', () => {

          beforeEach(() => {
            model = new Panel({
              buttons: [{}]
            });
            view = new PanelView({
              model
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          afterEach(() => {
            view.remove();
          });

        });

    });
  }
};
