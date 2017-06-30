var FileUploader = require('asset_manager/view/FileUploader');

module.exports = {
  run() {

    describe('File Uploader', () => {

      before(function () {
        this.$fixtures   = $("#fixtures");
        this.$fixture   = $('<div class="fileupload-fixture"></div>');
      });

      beforeEach(function () {
        this.view = new FileUploader({ config : {} });
        this.$fixture.empty().appendTo(this.$fixtures);
        this.$fixture.html(this.view.render().el);
      });

      afterEach(function () {
        this.view.remove();
      });

      after(function () {
        this.$fixture.remove();
      });

      it('Object exists', () => {
        expect(FileUploader).toExist();
      });

      it('Has correct prefix', function() {
        expect(this.view.pfx).toNotExist();
      });

      describe('Should be rendered correctly', () => {

          it('Has title', function() {
            expect(this.view.$el.find('#title').length).toEqual(1);
          });

          it('Title is empty', function() {
            expect(this.view.$el.find('#title').html()).toEqual('');
          });

          it('Has file input', function() {
            expect(this.view.$el.find('input[type=file]').length).toEqual(1);
          });

          it('File input is enabled', function() {
            expect(this.view.$el.find('input[type=file]').prop('disabled')).toEqual(true);
          });

      });

      describe('Interprets configurations correctly', () => {

          it('Has correct title', () => {
            var view = new FileUploader({ config : {
              uploadText : 'Test',
            } });
            view.render();
            expect(view.$el.find('#title').html()).toEqual('Test');
          });

          it('Could be disabled', () => {
            var view = new FileUploader({ config : {
              disableUpload: true,
            } });
            view.render();
            expect(view.$el.find('input[type=file]').prop('disabled')).toEqual(true);
          });

      });

    });
  }
}
