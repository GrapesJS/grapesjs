import ItemView from 'navigator/view/ItemView';
import config from 'navigator/config/config';
import EditorModel from 'editor/model/Editor';

describe('ItemView', () => {
  let itemView;

  const isVisible = itemView => {
    return itemView.module.isVisible(itemView.model);
  };

  beforeEach(() => {
    const em = new EditorModel();
    const defCmp = em.get('DomComponents').getType('default').model;

    itemView = new ItemView({
      model: new defCmp({}, { em }),
      module: em.get('LayerManager'),
      config: { ...config, em },
    });
  });

  describe('.isVisible', () => {
    it("should return `false` if the model's `style` object has a `display` property set to `none`, `true` otherwise", () => {
      expect(isVisible(itemView)).toEqual(true);
      itemView.model.addStyle({ display: '' });
      expect(isVisible(itemView)).toEqual(true);
      itemView.model.addStyle({ display: 'none' });
      expect(isVisible(itemView)).toEqual(false);
      itemView.model.addStyle({ display: 'block' });
      expect(isVisible(itemView)).toEqual(true);
    });
  });
});
