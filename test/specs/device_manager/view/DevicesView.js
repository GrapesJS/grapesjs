const DevicesView = require('device_manager/view/DevicesView');
const Devices = require('device_manager/model/Devices');

module.exports = {
  run() {
      describe('DevicesView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;
        var editorModel;

        beforeEach(() => {
          model = new Devices([]);
          view = new DevicesView({
            collection: model
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          document.body.querySelector('#fixtures').appendChild(view.render().el);
        });

        afterEach(() => {
          view.collection.reset();
        });

        it("The content is not empty", () => {
          expect(view.el.innerHTML).toExist();
        });

        it("No options without devices", () => {
          expect(view.getOptions()).toEqual('');
        });

        it("Render new button", () => {
          view.collection.add({});
          expect(view.$el.html()).toExist();
        });

        describe('With configs', () => {

          beforeEach(() => {
            editorModel = new Backbone.Model();
            model = new Devices([
              {name:'test1'},
              {name:'test2'}
            ]);
            view = new DevicesView({
              collection: model,
              config: { em: editorModel }
            });
            document.body.innerHTML = '<div id="fixtures"></div>';
            document.body.querySelector('#fixtures').appendChild(view.render().el);
          });

          it("Update device on select change", () => {
            view.$el.find('select').val('test2');
            view.updateDevice();
            expect(view.config.em.get('device')).toEqual('test2');
          });

          it("Render options", () => {
            expect(view.getOptions()).toEqual('<option value="test1">test1</option><option value="test2">test2</option>');
          });

        });

    });
  }
};
