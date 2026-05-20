import CopyComponent from '../../../../src/commands/view/CopyComponent';

describe('CopyComponent command', () => {
  test('should set the clipboard with selected components', () => {
    const command = new CopyComponent({});
    const set = jest.fn();
    const selected = [{ id: 'cmp-1' }, { id: 'cmp-2' }];
    const editor = {
      getModel: jest.fn(() => ({ set })),
      getSelectedAll: jest.fn(() => selected),
    };

    command.run(editor as any);

    expect(set).toHaveBeenCalledWith('clipboard', selected);
  });

  test('should use delegated copy target when available', () => {
    const command = new CopyComponent({});
    const set = jest.fn();
    const delegated = { id: 'delegated' };
    const component = {
      delegate: {
        copy: jest.fn(() => delegated),
      },
    };
    const editor = {
      getModel: jest.fn(() => ({ set })),
      getSelectedAll: jest.fn(() => [component]),
    };

    command.run(editor as any);

    expect(component.delegate.copy).toHaveBeenCalledWith(component);
    expect(set).toHaveBeenCalledWith('clipboard', [delegated]);
  });
});
