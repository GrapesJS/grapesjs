import ComponentPrev from '../../../../src/commands/view/ComponentPrev';

describe('ComponentPrev command', () => {
  test('should select the previous selectable sibling', () => {
    const command = new ComponentPrev({});
    const prevSelectable = { get: jest.fn(() => true) };
    const notSelectable = { get: jest.fn(() => false) };
    const parent = {
      getChildAt: jest.fn((index: number) => {
        if (index === 1) return notSelectable;
        if (index === 0) return prevSelectable;
        return null;
      }),
    };
    const selected = {
      parent: jest.fn(() => parent),
      index: jest.fn(() => 2),
    };
    const editor = {
      Canvas: { hasFocus: jest.fn(() => true) },
      getSelectedAll: jest.fn(() => [selected]),
      select: jest.fn(),
    };

    command.run(editor as any);

    expect(editor.select).toHaveBeenCalledWith([prevSelectable]);
  });

  test('should do nothing if the canvas has no focus', () => {
    const command = new ComponentPrev({});
    const editor = {
      Canvas: { hasFocus: jest.fn(() => false) },
      getSelectedAll: jest.fn(),
      select: jest.fn(),
    };

    command.run(editor as any);

    expect(editor.getSelectedAll).not.toHaveBeenCalled();
    expect(editor.select).not.toHaveBeenCalled();
  });
});
