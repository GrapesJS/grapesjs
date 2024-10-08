import defConfig from '../../../../src/navigator/config/config';
import EditorModel from '../../../../src/editor/model/Editor';
import ItemView from '../../../../src/navigator/view/ItemView';

describe('ItemView', () => {
  let itemView: ItemView;

  const isVisible = (itemView: ItemView) => {
    return itemView.module.isVisible(itemView.model);
  };

  beforeEach(() => {
    const em = new EditorModel();
    const defCmp = em.get('DomComponents').getType('default').model;

    itemView = new ItemView({
      model: new defCmp({}, { em }),
      module: em.get('LayerManager'),
      config: { ...defConfig(), em },
    } as any);
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
