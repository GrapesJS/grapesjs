import ComponentEnter from '../../../../src/commands/view/ComponentEnter';

describe('ComponentEnter command', () => {
  test('should select the first selectable child', () => {
    const command = new ComponentEnter({});
    const firstSelectable = { id: 'child-1' };
    const component = {
      components: jest.fn(() => [
        { get: jest.fn(() => false) },
        { get: jest.fn(() => true), ...firstSelectable },
        { get: jest.fn(() => true) },
      ]),
    };
    const editor = {
      Canvas: { hasFocus: jest.fn(() => true) },
      getSelectedAll: jest.fn(() => [component]),
      select: jest.fn(),
    };

    command.run(editor as any);

    expect(editor.select).toHaveBeenCalledWith([expect.objectContaining(firstSelectable)]);
  });

  test('should do nothing if the canvas has no focus', () => {
    const command = new ComponentEnter({});
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
