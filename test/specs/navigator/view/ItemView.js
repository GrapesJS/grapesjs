import ItemView from 'navigator/view/ItemView';
import config from 'navigator/config/config';
import EditorModel from 'editor/model/Editor';

describe('ItemView', () => {
  let itemView, fakeModel, fakeModelStyle;

  const isVisible = itemView => {
    return itemView.module.isVisible(itemView.model);
  };

  beforeEach(() => {
    fakeModelStyle = {};

    fakeModel = {
      get: jest.fn(),
      set: jest.fn(),
      getStyle: jest.fn(() => fakeModelStyle),
    };

    const em = new EditorModel();
    const module = em.get('LayerManager');

    itemView = new ItemView({
      model: fakeModel,
      module,
      config: { ...config, em },
    });
  });

  describe('.isVisible', () => {
    it("should return `false` if the model's `style` object has a `display` property set to `none`, `true` otherwise", () => {
      expect(isVisible(itemView)).toEqual(true);
      fakeModelStyle.display = '';
      expect(isVisible(itemView)).toEqual(true);
      fakeModelStyle.display = 'none';
      expect(isVisible(itemView)).toEqual(false);
      fakeModelStyle.display = 'block';
      expect(isVisible(itemView)).toEqual(true);
    });
  });
});
