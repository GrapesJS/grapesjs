import ComponentDelete from '../../../../src/commands/view/ComponentDelete';

describe('ComponentDelete command', () => {
  test('should remove selected removable components', () => {
    const command = new ComponentDelete({ em: { logWarning: jest.fn() } });
    const componentA = { get: jest.fn(() => true), remove: jest.fn() };
    const componentB = { get: jest.fn(() => true), remove: jest.fn() };
    const editor = {
      getSelectedAll: jest.fn(() => [componentA, componentB]),
      selectRemove: jest.fn(),
    };

    const result = command.run(editor as any, null, {});

    expect(componentA.remove).toHaveBeenCalledTimes(1);
    expect(componentB.remove).toHaveBeenCalledTimes(1);
    expect(editor.selectRemove).toHaveBeenCalledWith([componentA, componentB]);
    expect(result).toEqual([componentA, componentB]);
  });

  test('should use delegated remove target when available', () => {
    const command = new ComponentDelete({ em: { logWarning: jest.fn() } });
    const delegated = { remove: jest.fn() };
    const component = {
      get: jest.fn(() => true),
      delegate: {
        remove: jest.fn(() => delegated),
      },
    };
    const editor = {
      getSelectedAll: jest.fn(() => [component]),
      selectRemove: jest.fn(),
    };

    command.run(editor as any, null, {});

    expect(component.delegate.remove).toHaveBeenCalledWith(component);
    expect(delegated.remove).toHaveBeenCalledTimes(1);
    expect(editor.selectRemove).toHaveBeenCalledWith([component]);
  });

  test('should warn and skip non-removable components', () => {
    const logWarning = jest.fn();
    const command = new ComponentDelete({ em: { logWarning } });
    const component = { get: jest.fn(() => false), remove: jest.fn() };
    const editor = {
      getSelectedAll: jest.fn(() => [component]),
      selectRemove: jest.fn(),
    };

    const result = command.run(editor as any, null, {});

    expect(logWarning).toHaveBeenCalledWith('The element is not removable', { component });
    expect(component.remove).not.toHaveBeenCalled();
    expect(editor.selectRemove).toHaveBeenCalledWith([]);
    expect(result).toEqual([]);
  });
});
