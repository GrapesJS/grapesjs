const ComponentTextView = require('dom_components/view/ComponentTextView');
const Component = require('dom_components/model/Component');

module.exports = {
  run() {

      describe('ComponentTextView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;

        before(() => {
          $fixtures = $("#fixtures");
          $fixture = $('<div class="components-fixture"></div>');
        });

        beforeEach(() => {
          model = new Component();
          view = new ComponentTextView({
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

        it('Component empty', () => {
          expect($fixture.html()).toEqual('<div data-highlightable="1"></div>');
        });

        it('Input content is stored in model', () => {
          //view.enableEditing();
          view.el.innerHTML = 'test';
          //view.disableEditing();
          //model.get('content').should.equal('test');
        });

        it('Init with content', () => {
          model = new Component({ content: 'test' });
          view = new ComponentTextView({ model });
          expect(view.render().el.innerHTML).toEqual('test');
        });

    });
  }
};
