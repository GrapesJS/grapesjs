const ComponentTextView = require('dom_components/view/ComponentTextView');
const Component = require('dom_components/model/Component');

module.exports = {
  run : function(){

      describe('ComponentTextView', function() {

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
          view = new ComponentTextView({
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
          expect($fixture.html()).toEqual('<div data-highlightable="1"></div>');
        });

        it('Input content is stored in model', function() {
          //view.enableEditing();
          view.el.innerHTML = 'test';
          //view.disableEditing();
          //model.get('content').should.equal('test');
        });

        it('Init with content', function() {
          model = new Component({ content: 'test' });
          view = new ComponentTextView({ model: model });
          expect(view.render().el.innerHTML).toEqual('test');
        });

    });
  }
};
