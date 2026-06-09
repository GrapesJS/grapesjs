import FileUploader, { isFileAccepted } from '../../../../src/asset_manager/view/FileUploader';

const f = (type: string, name = 'x') => ({ type, name }) as File;

describe('isFileAccepted (#6032)', () => {
  test('allows everything when accept is empty or */*', () => {
    expect(isFileAccepted(f('video/mp4', 'a.mp4'), '')).toBe(true);
    expect(isFileAccepted(f('video/mp4', 'a.mp4'), '*/*')).toBe(true);
    expect(isFileAccepted(f('video/mp4', 'a.mp4'), undefined)).toBe(true);
  });
  test('matches MIME wildcard (image/*)', () => {
    expect(isFileAccepted(f('image/png', 'a.png'), 'image/*')).toBe(true);
    expect(isFileAccepted(f('video/mp4', 'a.mp4'), 'image/*')).toBe(false);
  });
  test('matches exact MIME and comma lists', () => {
    expect(isFileAccepted(f('image/png'), 'image/png,image/jpeg')).toBe(true);
    expect(isFileAccepted(f('image/gif'), 'image/png,image/jpeg')).toBe(false);
  });
  test('matches file extensions', () => {
    expect(isFileAccepted(f('', 'photo.PNG'), '.png')).toBe(true);
    expect(isFileAccepted(f('', 'clip.mp4'), '.png,.jpg')).toBe(false);
  });
});

describe('File Uploader', () => {
  let obj: FileUploader;

  beforeEach(() => {
    obj = new FileUploader({ config: {} });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures')!.appendChild(obj.render().el);
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
      const view = new FileUploader({
        config: {
          disableUpload: true,
          upload: 'something',
        },
      });
      view.render();
      expect(view.$el.find('input[type=file]').prop('disabled')).toEqual(true);
    });

    test('Handles multiUpload false', () => {
      const view = new FileUploader({
        config: {
          multiUpload: false,
        },
      });
      view.render();
      expect(view.$el.find('input[type=file]').prop('multiple')).toBeFalsy();
    });

    test('Handles embedAsBase64 parameter', () => {
      const view = new FileUploader({
        config: {
          embedAsBase64: true,
        },
      });
      view.render();
      expect(view.$el.find('input[type=file]').prop('disabled')).toEqual(false);
      expect(view.uploadFile).toEqual(FileUploader.embedAsBase64);
    });
  });

  describe('Drag-drop respects accept (#6032)', () => {
    const makeView = () => {
      const customFetch = jest.fn(() => Promise.resolve('[]'));
      // headers:{} is REQUIRED: direct construction does NOT merge the module's config
      // defaults, and uploadFile reads `config.headers` before fetching - a missing
      // headers object throws before customFetch is ever reached.
      const view = new FileUploader({ config: { upload: 'http://localhost/up', headers: {}, customFetch } });
      document.body.innerHTML = '<div id="fx"></div>';
      document.body.querySelector('#fx')!.appendChild(view.render().el);
      view.$el.find('input[type=file]').attr('accept', 'image/*'); // what OpenAssets sets for images
      return { view, customFetch };
    };
    const drop = (view: FileUploader, file: File) =>
      view.uploadFile({ dataTransfer: { files: [file] }, preventDefault() {} } as any);

    test('rejects a dropped video (no upload triggered)', () => {
      const { view, customFetch } = makeView();
      drop(view, new File(['x'], 'clip.mp4', { type: 'video/mp4' }));
      expect(customFetch).not.toHaveBeenCalled();
    });
    test('still uploads a dropped image', () => {
      const { view, customFetch } = makeView();
      drop(view, new File(['x'], 'pic.png', { type: 'image/png' }));
      expect(customFetch).toHaveBeenCalledTimes(1);
    });
  });
});
