import ComponentNext from '../../../../src/commands/view/ComponentNext';

describe('ComponentNext command', () => {
  test('should select the next selectable sibling', () => {
    const command = new ComponentNext({});
    const nextSelectable = { get: jest.fn(() => true) };
    const notSelectable = { get: jest.fn(() => false) };
    const parent = {
      components: jest.fn(() => ({ length: 3 })),
      getChildAt: jest.fn((index: number) => {
        if (index === 1) return notSelectable;
        if (index === 2) return nextSelectable;
        return null;
      }),
    };
    const selected = {
      parent: jest.fn(() => parent),
      index: jest.fn(() => 0),
    };
    const editor = {
      Canvas: { hasFocus: jest.fn(() => true) },
      getSelectedAll: jest.fn(() => [selected]),
      select: jest.fn(),
    };

    command.run(editor as any);

    expect(editor.select).toHaveBeenCalledWith([nextSelectable]);
  });

  test('should do nothing if the canvas has no focus', () => {
    const command = new ComponentNext({});
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
