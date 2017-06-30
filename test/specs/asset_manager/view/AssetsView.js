var AssetsView = require('asset_manager/view/AssetsView');
var Assets = require('asset_manager/model/Assets');

module.exports = {
  run() {

    describe('AssetsView', () => {

      var obj;

      before(function () {
        this.$fixtures   = $("#fixtures");
        this.$fixture   = $('<div class="assets-fixture"></div>');
      });

      beforeEach(function () {
        this.coll   = new Assets([]);
        this.view = new AssetsView({
          config : {},
          collection: this.coll
        });
        obj = this.view;
        this.$fixture.empty().appendTo(this.$fixtures);
        this.$fixture.html(this.view.render().el);
      });

      afterEach(function () {
        this.view.collection.reset();
      });

      after(function () {
        this.$fixture.remove();
      });

      it('Object exists', () => {
        expect(AssetsView).toExist();
      });

      it("Collection is empty", function (){
        expect(this.view.getAssetsEl().innerHTML).toNotExist();
      });

      it("Add new asset", function (){
        sinon.stub(this.view, "addAsset");
        this.coll.add({src: 'test'});
        expect(this.view.addAsset.calledOnce).toEqual(true);
      });

      it("Render new asset", function (){
        this.coll.add({src: 'test'});
        expect(this.view.getAssetsEl().innerHTML).toExist();
      });

      it("Render correctly new image asset", function (){
        this.coll.add({ type: 'image', src: 'test'});
        var asset = this.view.getAssetsEl().firstChild;
        expect(asset.tagName).toEqual('DIV');
        expect(asset.innerHTML).toExist();
      });

      it("Clean collection from asset", function (){
        var model = this.coll.add({src: 'test'});
        this.coll.remove(model);
        expect(this.view.getAssetsEl().innerHTML).toNotExist();
      });

      it("Deselect works", function (){
        this.coll.add([{},{}]);
        var $asset = this.view.$el.children().first();
        $asset.attr('class', this.view.pfx + 'highlight');
        this.coll.trigger('deselectAll');
        expect($asset.attr('class')).toNotExist();
      });

      it("Returns not empty assets element", () => {
        expect(obj.getAssetsEl()).toExist();
      });

      it("Returns not empty url input", () => {
        expect(obj.getInputUrl()).toExist();
      });

      it("Add image asset from input string", () => {
        obj.getInputUrl().value = "test";
        obj.addFromStr({
          preventDefault() {}
        });
        var asset = obj.collection.at(0);
        expect(asset.get('src')).toEqual('test');
      });

    });

  }
}
