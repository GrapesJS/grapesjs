var path = 'BlockManager/view/';
define([path + 'BlocksView', 'BlockManager/model/Blocks'],
  function(BlocksView, Blocks) {

    return {
      run : function(){
          describe('BlocksView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;
            var editorModel;
            var ppfx;

            before(function () {
              $fixtures = $("#fixtures");
              $fixture = $('<div class="devices-fixture"></div>');
            });

            beforeEach(function () {
              model = new Blocks([]);
              view = new BlocksView({ collection: model });
              $fixture.empty().appendTo($fixtures);
              $fixture.html(view.render().el);
            });

            afterEach(function () {
              view.collection.reset();
            });

            after(function () {
              $fixture.remove();
            });

            it("The container is not empty", function (){
              view.el.outerHTML.should.be.not.empty;
            });

            it("No children inside", function (){
              view.el.children.length.should.equal(0);
            });

            it("Render children on add", function (){
              model.add({});
              view.el.children.length.should.equal(1);
              model.add([{},{}]);
              view.el.children.length.should.equal(3);
            });

            it("Destroy children on remove", function (){
              model.add([{},{}]);
              view.el.children.length.should.equal(2);
              model.at(0).destroy();
              view.el.children.length.should.equal(1);
            });

            describe('With configs', function() {

              beforeEach(function () {
                ppfx = 'pfx-t-';
                editorModel = new Backbone.Model();
                model = new Blocks([
                  {name:'test1'},
                  {name:'test2'}
                ]);
                view = new BlocksView({
                  collection: model,
                },{
                  pStylePrefix: ppfx
                });
                $fixture.empty().appendTo($fixtures);
                $fixture.html(view.render().el);
              });

              it("Render children", function (){
                view.el.children.length.should.equal(2);
              });

              it("Render container", function (){
                view.el.getAttribute('class').should.equal(ppfx + 'blocks-c');
              });

            });

        });
      }
    };

});