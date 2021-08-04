/**
 * @jest-environment node
 */

describe('GrapesJS Headless', () => {
  test('Can init editor', () => {
    const editor = grapesjs.init({ headless: true });
    expect(editor).toBeTruthy();
    editor.destroy();
  });
});
