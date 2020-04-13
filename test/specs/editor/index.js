import Editor from 'editor';

const { keys } = Object;

describe('Editor', () => {
  const editor = new Editor();

  beforeEach(() => {
    editor.init();
  });

  afterEach(() => {
    editor.destroy();
  });

  test('Object exists', () => {
    expect(editor).toBeTruthy();
  });

  test('Has no components', () => {
    const all = editor.Components.allById();
    const allKeys = keys(all);
    // By default 1 wrapper components is created
    expect(allKeys.length).toBe(1);
    expect(allKeys[0]).toBe('wrapper');
  });

  test('Has no CSS rules', () => {
    const all = editor.Css.getAll();
    expect(all.length).toBe(0);
  });

  test('Has one default frame', () => {
    const all = editor.Canvas.getFrames();
    expect(all.length).toBe(1);
  });

  test('The default frame has the same main component and css', () => {
    const wrapper = editor.getWrapper();
    const style = editor.getStyle();
    const frame = editor.Canvas.getFrame();
    expect(wrapper).toBe(frame.get('root'));
    expect(style).toBe(frame.get('styles'));
  });

  //   test('Components are added to the default frame', () => {
  //     const wrapper = editor.getWrapper();
  //     const component = wrapper.append('<div>Component</div>');
  //     const frame = editor.Canvas.getFrame();
  //     console.log('WRAPPER', wrapper.components().length);
  //     console.log('ROOT', frame.get('root').components().length);
  //     expect(wrapper).toBe(frame.get('root'));
  //   });

  //   test('New component correctly added', () => {
  //     const all = editor.Css.getAll();
  //     expect(all.length).toBe(0);
  //   });
});
