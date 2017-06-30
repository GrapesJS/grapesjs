const ButtonView = require('panels/view/ButtonView');
const Button = require('panels/model/Button');

module.exports = {
  run() {

      describe('ButtonView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;
        var btnClass = 'btn';

        before(() => {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="cssrule-fixture"></div>');
        });

        beforeEach(() => {
          model = new Button();
          view = new ButtonView({
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

        it('Button empty', () => {
          expect($fixture.html()).toEqual('<span class="' + btnClass+ '"></span>');
        });

        it('Update class', () => {
          model.set('className','test');
          expect(view.el.getAttribute('class')).toEqual(btnClass + ' test');
        });

        it('Update attributes', () => {
          model.set('attributes',{
            'data-test': 'test-value'
          });
          expect(view.el.getAttribute('data-test')).toEqual('test-value');
        });

        it('Check enable active', () => {
          model.set('active', true, {silent: true});
          view.checkActive();
          expect(view.el.getAttribute('class')).toEqual(btnClass + ' active');
        });

        it('Check disable active', () => {
          model.set('active', true, {silent: true});
          view.checkActive();
          model.set('active', false, {silent: true});
          view.checkActive();
          expect(view.el.getAttribute('class')).toEqual(btnClass);
        });

        it('Renders correctly', () => {
          expect(view.render()).toExist();
        });

    });
  }
};
