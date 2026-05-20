import ComponentExit from '../../../../src/commands/view/ComponentExit';

describe('ComponentExit command', () => {
  test('should select the first selectable parent', () => {
    const command = new ComponentExit({});
    const selectableParent = {
      get: jest.fn(() => true),
      parent: jest.fn(),
    };
    const nonSelectableParent = {
      get: jest.fn(() => false),
      parent: jest.fn(() => selectableParent),
    };
    const component = {
      parent: jest.fn(() => nonSelectableParent),
    };
    const editor = {
      Canvas: { hasFocus: jest.fn(() => true) },
      getSelectedAll: jest.fn(() => [component]),
      select: jest.fn(),
    };

    command.run(editor as any, null, {});

    expect(editor.select).toHaveBeenCalledWith([selectableParent]);
  });

  test('should select parent when forced even without canvas focus', () => {
    const command = new ComponentExit({});
    const parent = {
      get: jest.fn(() => true),
      parent: jest.fn(),
    };
    const component = {
      parent: jest.fn(() => parent),
    };
    const editor = {
      Canvas: { hasFocus: jest.fn(() => false) },
      getSelectedAll: jest.fn(() => [component]),
      select: jest.fn(),
    };

    command.run(editor as any, null, { force: true });

    expect(editor.select).toHaveBeenCalledWith([parent]);
  });

  test('should do nothing if the canvas has no focus and force is not set', () => {
    const command = new ComponentExit({});
    const editor = {
      Canvas: { hasFocus: jest.fn(() => false) },
      getSelectedAll: jest.fn(),
      select: jest.fn(),
    };

    command.run(editor as any, null, {});

    expect(editor.getSelectedAll).not.toHaveBeenCalled();
    expect(editor.select).not.toHaveBeenCalled();
  });
});
