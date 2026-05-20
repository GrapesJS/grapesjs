import CanvasClear from '../../../../src/commands/view/CanvasClear';

describe('CanvasClear command', () => {
  test('should clear components and css', () => {
    const command = new CanvasClear({});
    const editor = {
      Components: { clear: jest.fn() },
      Css: { clear: jest.fn() },
    };

    command.run(editor);

    expect(editor.Components.clear).toHaveBeenCalledTimes(1);
    expect(editor.Css.clear).toHaveBeenCalledTimes(1);
  });
});
