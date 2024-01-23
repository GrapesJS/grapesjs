import Editor from '../../../src/editor/model/Editor';
import TraitManager from '../../../src/trait_manager';

describe('TraitManager', () => {
  let em: Editor;
  let tm: TraitManager;

  beforeEach(() => {
    em = new Editor({
      mediaCondition: 'max-width',
      avoidInlineStyle: true,
    });
    tm = em.Traits;
    // em.get('PageManager').onLoad();
  });

  afterEach(() => {
    em.destroy();
  });

  test('TraitManager exists', () => {
    expect(tm).toBeTruthy();
  });
});
