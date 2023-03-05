import FileUploader from 'asset_manager/view/FileUploader';

describe('File Uploader', () => {
  let obj;

  beforeEach(() => {
    obj = new FileUploader({ config: {} });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures').appendChild(obj.render().el);
  });

  afterEach(() => {
    obj.remove();
  });

  test('Object exists', () => {
    expect(FileUploader).toBeTruthy();
  });

  test('Has correct prefix', () => {
    expect(obj.pfx).toBeFalsy();
  });

  describe('Should be rendered correctly', () => {
    test('Has title', () => {
      expect(obj.$el.find('#title').length).toEqual(1);
    });

    test('Title is empty', () => {
      expect(obj.$el.find('#title').html()).toEqual('');
    });

    test('Has file input', () => {
      expect(obj.$el.find('input[type=file]').length).toEqual(1);
    });

    test('File input is enabled', () => {
      expect(obj.$el.find('input[type=file]').prop('disabled')).toEqual(true);
    });
  });

  describe('Interprets configurations correctly', () => {
    test('Could be disabled', () => {
      var view = new FileUploader({
        config: {
          disableUpload: true,
          upload: 'something',
        },
      });
      view.render();
      expect(view.$el.find('input[type=file]').prop('disabled')).toEqual(true);
    });

    test('Handles multiUpload false', () => {
      var view = new FileUploader({
        config: {
          multiUpload: false,
        },
      });
      view.render();
      expect(view.$el.find('input[type=file]').prop('multiple')).toBeFalsy();
    });

    test('Handles embedAsBase64 parameter', () => {
      var view = new FileUploader({
        config: {
          embedAsBase64: true,
        },
      });
      view.render();
      expect(view.$el.find('input[type=file]').prop('disabled')).toEqual(false);
      expect(view.uploadFile).toEqual(FileUploader.embedAsBase64);
    });
  });
});
