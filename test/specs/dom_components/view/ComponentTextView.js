const ComponentTextView = require('dom_components/view/ComponentTextView');
const Component = require('dom_components/model/Component');
const grapesjs = require('grapesjs');

module.exports = {
  run() {

      describe('ComponentTextView', () => {

        var fixtures;
        var model;
        var view;

        beforeEach(() => {
          model = new Component();
          view = new ComponentTextView({
            model
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.querySelector('#fixtures');
          fixtures.appendChild(view.render().el);
        });

        afterEach(() => {
          view.remove();
        });

        it('Component empty', () => {
          expect(fixtures.innerHTML).toEqual('<div data-highlightable="1"></div>');
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
          fixtures.appendChild(view.render().el);
          expect(view.el.innerHTML).toEqual('test');
        });

        it('Enable and disable editing triggers events', () => {
          var triggeredOnStart = false, triggeredOnEnd = false;

          // There may be a better way to handle this than
          // initializing an entire instance of the editor
          // but we need access to things like the Parser
          // and this was easier than mocking everything.
          model = new Component({
            editable: true
          });
          var components = model.get('components');
          components.editor = grapesjs.init({
            autorender: false,
            container: '#gjs'
          }).editor;
          model.set('components', components);

          view = new ComponentTextView({ model });
          view.rte = {
            attach: () => { },
            detach: () => { },
            focus: () => { }
          };
          view.em = _.extend({}, Backbone.Events);
          fixtures.appendChild(view.render().el);

          view.em.on('rte:attach', () => { triggeredOnStart = true; });
          view.em.on('rte:detach', () => { triggeredOnEnd = true; });

          view.enableEditing();
          view.disableEditing();

          expect(triggeredOnStart).toEqual(true);
          expect(triggeredOnEnd).toEqual(true);
        });

    });
  }
};
