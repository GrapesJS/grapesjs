const ButtonView = require('panels/view/ButtonView');
const Button = require('panels/model/Button');

module.exports = {
  run() {

      describe('ButtonView', () => {

        var fixtures;
        var model;
        var view;
        var btnClass = 'btn';

        beforeEach(() => {
          model = new Button();
          view = new ButtonView({
            model: model
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.querySelector('#fixtures');
          fixtures.appendChild(view.render().el);
        });

        afterEach(() => {
          view.remove();
        });

        it('Button empty', () => {
          expect(fixtures.innerHTML).toEqual('<span class="' + btnClass+ '"></span>');
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
          expect(view.el.getAttribute('class')).toContain(btnClass + ' active');
        });

        it('Check disable active', () => {
          model.set('active', true, {silent: true});
          view.checkActive();
          model.set('active', false, {silent: true});
          view.checkActive();
          expect(view.el.getAttribute('class')).toEqual(btnClass);
        });

        it('Disable the button', () => {
          model.set('disable', true, {silent: true});
          view.updateDisable();
          expect(view.el.getAttribute('class')).toEqual(btnClass + ' active');
        });

        it('Enable the disabled button', () => {
          model.set('disable', true, {silent: true});
          view.updateDisable();
          expect(view.el.getAttribute('class')).toEqual(btnClass + ' active');
          model.set('disable', false, {silent: true});
          view.updateDisable();
          expect(view.el.getAttribute('class')).toEqual(btnClass);
        });

        it('Cancels the click action when button is disabled', () => {
          const stub = sinon.stub(view, 'toogleActive');
          model.set('disable', true, {silent: true});
          view.clicked();
          expect(stub.called).toEqual(false);
        });

        it('Enable the click action when button is enable', () => {
          const stub = sinon.stub(view, 'toogleActive');
          model.set('disable', false, {silent: true});
          view.clicked();
          expect(stub.called).toEqual(true);
        });

        it('Renders correctly', () => {
          expect(view.render()).toExist();
        });

    });
  }
};
