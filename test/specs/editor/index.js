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
});
