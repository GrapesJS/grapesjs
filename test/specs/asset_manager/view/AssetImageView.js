var AssetImageView = require('asset_manager/view/AssetImageView');
var AssetImage = require('asset_manager/model/AssetImage');
var Assets = require('asset_manager/model/Assets');

module.exports = {
  run() {

    describe('AssetImageView', () => {

      before(function () {
        this.$fixtures = $("#fixtures");
        this.$fixture = $('<div class="asset-fixture"></div>');
      });

      beforeEach(function () {
        var coll   = new Assets();
        var model = coll.add({ type:'image', src: '/test' });
        this.view = new AssetImageView({
          config : {},
          model
        });
        this.$fixture.empty().appendTo(this.$fixtures);
        this.$fixture.html(this.view.render().el);
      });

      afterEach(function () {
        this.view = null;
      });

      after(function () {
        this.$fixture.empty();
      });

      it('Object exists', () => {
        expect(AssetImageView).toExist();
      });

      describe('Asset should be rendered correctly', () => {

          it('Has preview box', function() {
            var $asset = this.view.$el;
            expect($asset.find('#preview').length).toEqual(1);
          });

          it('Has meta box', function() {
            var $asset = this.view.$el;
            expect($asset.find('#meta').length).toEqual(1);
          });

          it('Has close button', function() {
            var $asset = this.view.$el;
            expect($asset.find('#close').length).toEqual(1);
          });

      });

      it('Could be selected', function() {
        var spy = expect.spyOn(this.view, 'updateTarget');
        this.view.$el.trigger('click');
        expect(this.view.$el.attr('class')).toInclude('highlight');
        expect(spy).toHaveBeenCalled();
      });

      it('Could be chosen', function() {
        sinon.stub(this.view, 'updateTarget');
        var spy = expect.spyOn(this.view, 'updateTarget');
        this.view.$el.trigger('dblclick');
        expect(spy).toHaveBeenCalled();
        //this.view.updateTarget.calledOnce.should.equal(true);
      });

      it('Could be removed', function() {
        var spy = sinon.spy();
        this.view.model.on("remove", spy);
        this.view.$el.find('#close').trigger('click');
        expect(spy.called).toEqual(true);
      });

    });

  }
};
