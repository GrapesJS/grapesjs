import MoveComponent from '../../../../src/commands/view/MoveComponent';

describe('MoveComponent command', () => {
  test('rollback should cancel drag on escape', () => {
    const command = new MoveComponent({});
    const cancelDrag = jest.fn();
    command.sorter = { cancelDrag };

    command.rollback({ which: 27 }, false);

    expect(cancelDrag).toHaveBeenCalledTimes(1);
  });

  test('stop should reset wrapper and remove helper classes', () => {
    const command = new MoveComponent({});
    const wrapper: any = {};
    wrapper.css = jest.fn(() => wrapper);
    wrapper.unbind = jest.fn(() => wrapper);
    wrapper.removeClass = jest.fn(() => wrapper);
    const removeBadgeClass = jest.fn();
    const removeHighlighterClass = jest.fn();
    command.$wrapper = wrapper;
    command.$badge = { removeClass: removeBadgeClass };
    command.$hl = { removeClass: removeHighlighterClass };
    command.badgeClass = 'badge-warning';
    command.hoverClass = 'highlighter-warning';
    command.noSelClass = 'no-select';
    command.onHovered = jest.fn();
    command.stopSelectComponent = jest.fn();
    command.em = { setSelected: jest.fn() } as any;
    command.toggleToolsEl = jest.fn();
    command.editor = { stopCommand: jest.fn() };

    command.stop();

    expect(removeBadgeClass).toHaveBeenCalledWith('badge-warning');
    expect(removeHighlighterClass).toHaveBeenCalledWith('highlighter-warning');
    expect(wrapper.css).toHaveBeenCalledWith('cursor', '');
    expect(wrapper.unbind).toHaveBeenCalledTimes(1);
    expect(wrapper.removeClass).toHaveBeenCalledWith('no-select');
  });
});
