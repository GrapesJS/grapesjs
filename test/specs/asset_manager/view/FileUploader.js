var FileUploader = require('asset_manager/view/FileUploader');


module.exports = {
  run() {

    describe('File Uploader', () => {

      let obj;

      beforeEach(function () {
        obj = new FileUploader({ config : {} });
        document.body.innerHTML = '<div id="fixtures"></div>';
        document.body.querySelector('#fixtures').appendChild(obj.render().el);
      });

      afterEach(function () {
        obj.remove();
      });

      it('Object exists', () => {
        expect(FileUploader).toExist();
      });

      it('Has correct prefix', function() {
        expect(obj.pfx).toNotExist();
      });

      describe('Should be rendered correctly', () => {

          it('Has title', function() {
            expect(obj.$el.find('#title').length).toEqual(1);
          });

          it('Title is empty', function() {
            expect(obj.$el.find('#title').html()).toEqual('');
          });

          it('Has file input', function() {
            expect(obj.$el.find('input[type=file]').length).toEqual(1);
          });

          it('File input is enabled', function() {
            expect(obj.$el.find('input[type=file]').prop('disabled')).toEqual(true);
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
              upload: 'something'
            } });
            view.render();
            expect(view.$el.find('input[type=file]').prop('disabled')).toEqual(true);
          });

          it('Handles embedAsBase64 parameter', () => {
            var view = new FileUploader({ config : {
              embedAsBase64: true
            } });
            view.render();
            expect(view.$el.find('input[type=file]').prop('disabled')).toEqual(false);
            expect(view.uploadFile).toEqual(FileUploader.embedAsBase64);
          });

      });

    });
  }
}
