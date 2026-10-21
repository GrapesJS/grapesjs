import Frame from '../../../src/canvas/model/Frame';
import FrameView from '../../../src/canvas/view/FrameView';
import EditorModel from '../../../src/editor/model/Editor';
import ComponentView from '../../../src/dom_components/view/ComponentView';

describe('Canvas frame accessible name', () => {
  let em: EditorModel;

  afterEach(() => {
    em.destroy();
  });

  const createFrame = () => new FrameView(new Frame(em.Canvas, {}));

  test('names the editor iframe by default', () => {
    em = new EditorModel({});
    const view = createFrame();
    expect(view.el.tagName).toBe('IFRAME');
    expect(view.el.title).toBe('Editor canvas');
    expect(view.el.hasAttribute('allowfullscreen')).toBe(true);
  });

  test('uses the configured translation', () => {
    em = new EditorModel({
      i18n: {
        locale: 'fr',
        detectLocale: false,
        messagesAdd: { fr: { canvas: { frameTitle: 'Zone de contenu' } } },
      },
    });
    expect(createFrame().el.title).toBe('Zone de contenu');
  });

  test('falls back to English when the locale has no frame title', () => {
    em = new EditorModel({ i18n: { locale: 'fr', detectLocale: false } });
    expect(createFrame().el.title).toBe('Editor canvas');
  });

  test('Releases CSS rule views when the canvas frame is removed', () => {
    em = new EditorModel({});
    const view = createFrame();
    const doc = document.implementation.createHTMLDocument();
    jest.spyOn(view, 'getDoc').mockReturnValue(doc);
    const rule = em.Css.setRule('.test', { color: 'red' });
    const rootOptions = { model: view.model.getComponent(), config: { em, frameView: view } };
    const rootView = new ComponentView(rootOptions);
    view._onRootMount(rootView);
    expect(rule.views).toHaveLength(1);
    view._onRootMount(rootView);
    expect(rule.views).toHaveLength(1);
    view.remove();
    expect(rule.views).toHaveLength(0);
    rootView.remove();
  });
});
