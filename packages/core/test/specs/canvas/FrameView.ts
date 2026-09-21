import Frame from '../../../src/canvas/model/Frame';
import FrameView from '../../../src/canvas/view/FrameView';
import EditorModel from '../../../src/editor/model/Editor';

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
});
