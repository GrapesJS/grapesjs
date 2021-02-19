import ItemView from 'navigator/view/ItemView';
import config from 'navigator/config/config';

describe('ItemView', () => {
  let itemView, fakeModel, fakeModelStyle;

  beforeEach(() => {
    fakeModelStyle = {};

    fakeModel = {
      get: jest.fn(),
      set: jest.fn(),
      getStyle: jest.fn(() => fakeModelStyle)
    };

    itemView = new ItemView({
      model: fakeModel,
      config: {
        ...config,
        em: {
          get: jest.fn(() => ({ stylePrefix: '' }))
        }
      }
    });
  });

  describe('.isVisible', () => {
    it("should return `false` if the model's `style` object has a `display` property set to `none`, `true` otherwise", () => {
      expect(itemView.isVisible()).toEqual(true);
      fakeModelStyle.display = '';
      expect(itemView.isVisible()).toEqual(true);
      fakeModelStyle.display = 'none';
      expect(itemView.isVisible()).toEqual(false);
      fakeModelStyle.display = 'block';
      expect(itemView.isVisible()).toEqual(true);
    });
  });
});
