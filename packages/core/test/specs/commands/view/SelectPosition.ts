import SelectPosition from '../../../../src/commands/view/SelectPosition';

describe('SelectPosition command', () => {
  test('nearFloat should detect floating neighbors', () => {
    const command = new SelectPosition({});
    const dims = [
      [0, 0, 0, 0, true],
      [0, 0, 0, 0, false],
    ];

    expect(command.nearFloat(1, 'before', dims)).toBe(1);
  });

  test('stop should cancel drag and reset wrapper cursor', () => {
    const command = new SelectPosition({});
    const wrapper: any = {};
    wrapper.css = jest.fn(() => wrapper);
    wrapper.unbind = jest.fn(() => wrapper);
    command.$wrapper = wrapper;
    command.sorter = { cancelDrag: jest.fn() };
    command.cDim = [];
    command.posMethod = 'before';
    command.posIndex = 0;

    command.stop();

    expect(command.sorter.cancelDrag).toHaveBeenCalledTimes(1);
    expect(wrapper.css).toHaveBeenCalledWith('cursor', '');
    expect(wrapper.unbind).toHaveBeenCalledTimes(1);
  });
});
