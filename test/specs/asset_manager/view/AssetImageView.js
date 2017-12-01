var AssetImageView = require('asset_manager/view/AssetImageView');
var AssetImage = require('asset_manager/model/AssetImage');
var Assets = require('asset_manager/model/Assets');

module.exports = {
  run() {
    let obj;

    describe('AssetImageView', () => {

      beforeEach(function () {
        var coll   = new Assets();
        var model = coll.add({ type:'image', src: '/test' });
        obj = new AssetImageView({
          collection: new Assets(),
          config : {},
          model
        });
        document.body.innerHTML = '<div id="fixtures"></div>';
        document.body.querySelector('#fixtures').appendChild(obj.render().el);
      });

      afterEach(function () {
        obj = null;
        document.body.innerHTML = '';
      });

      it('Object exists', () => {
        expect(AssetImageView).toExist();
      });

      describe('Asset should be rendered correctly', () => {

          it('Has preview box', function() {
            var $asset = obj.$el;
            expect($asset.find('.preview').length).toEqual(1);
          });

          it('Has meta box', function() {
            var $asset = obj.$el;
            expect($asset.find('.meta').length).toEqual(1);
          });

          it('Has close button', function() {
            var $asset = obj.$el;
            expect($asset.find('[data-toggle=asset-remove]').length).toEqual(1);
          });

      });

      it('Could be selected', function() {
        var spy = expect.spyOn(obj, 'updateTarget');
        obj.$el.trigger('click');
        expect(obj.$el.attr('class')).toInclude('highlight');
        expect(spy).toHaveBeenCalled();
      });

      it('Could be chosen', function() {
        sinon.stub(obj, 'updateTarget');
        var spy = expect.spyOn(obj, 'updateTarget');
        obj.$el.trigger('dblclick');
        expect(spy).toHaveBeenCalled();
        //obj.updateTarget.calledOnce.should.equal(true);
      });

      it('Could be removed', function() {
        var spy = sinon.spy();
        obj.model.on("remove", spy);
        obj.onRemove({stopImmediatePropagation() {}});
        expect(spy.called).toEqual(true);
      });

    });

  }
};
