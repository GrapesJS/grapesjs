var path = 'DeviceManager/view/';
define([path + 'DevicesView', 'DeviceManager/model/Devices'],
  function(DevicesView, Devices) {

    return {
      run : function(){
          describe('DevicesView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;
            var editorModel;

            before(function () {
              $fixtures  = $("#fixtures");
              $fixture   = $('<div class="devices-fixture"></div>');
            });

            beforeEach(function () {
              model = new Devices([]);
              view = new DevicesView({
                collection: model
              });
              $fixture.empty().appendTo($fixtures);
              $fixture.html(view.render().el);
            });

            afterEach(function () {
              view.collection.reset();
            });

            after(function () {
              $fixture.remove();
            });

            it("The content is not empty", function (){
              view.el.innerHTML.should.be.not.empty;
            });

            it("No options without devices", function (){
              view.getOptions().should.equal('');
            });

            it("Render new button", function (){
              view.collection.add({});
              view.$el.html().should.not.be.empty;
            });

            describe('With configs', function() {

              beforeEach(function () {
                editorModel = new Backbone.Model();
                model = new Devices([
                  {name:'test1'},
                  {name:'test2'}
                ]);
                view = new DevicesView({
                  collection: model,
                  config: { em: editorModel }
                });
                $fixture.empty().appendTo($fixtures);
                $fixture.html(view.render().el);
              });

              it("Update device on select change", function (){
                view.$el.find('select').val('test2');
                view.updateDevice();
                view.config.em.get('device').should.equal('test2');
              });

              it("Render options", function (){
                view.getOptions().should.equal('<option value="test1">test1</option><option value="test2">test2</option>');
              });

            });

        });
      }
    };

});