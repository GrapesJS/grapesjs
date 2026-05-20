import OpenStyleManager from '../../../../src/commands/view/OpenStyleManager';

describe('OpenStyleManager command', () => {
  test('toggleSm should show content when a target is selected', () => {
    const command = new OpenStyleManager({});
    command.sender = { get: jest.fn(() => true) };
    command.sm = { getSelected: jest.fn(() => true) };
    command.$cntInner = { show: jest.fn(), hide: jest.fn() };
    command.$header = { show: jest.fn(), hide: jest.fn() };

    command.toggleSm();

    expect(command.$cntInner.show).toHaveBeenCalledTimes(1);
    expect(command.$header.hide).toHaveBeenCalledTimes(1);
  });

  test('stop should hide content and header', () => {
    const command = new OpenStyleManager({});
    command.$cntInner = { hide: jest.fn() };
    command.$header = { hide: jest.fn() };

    command.stop();

    expect(command.$cntInner.hide).toHaveBeenCalledTimes(1);
    expect(command.$header.hide).toHaveBeenCalledTimes(1);
  });
});
