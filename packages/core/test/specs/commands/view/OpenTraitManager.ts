import OpenTraitManager from '../../../../src/commands/view/OpenTraitManager';

describe('OpenTraitManager command', () => {
  test('toggleTm should show content when a single target is selected', () => {
    const command = new OpenTraitManager({});
    command.sender = { get: jest.fn(() => true) };
    command.target = { getSelectedAll: jest.fn(() => [{}]) };
    command.$cn2 = { show: jest.fn(), hide: jest.fn() };
    command.$header = { show: jest.fn(), hide: jest.fn() };

    command.toggleTm();

    expect(command.$cn2.show).toHaveBeenCalledTimes(1);
    expect(command.$header.hide).toHaveBeenCalledTimes(1);
  });

  test('stop should hide content and header', () => {
    const command = new OpenTraitManager({});
    command.$cn2 = { hide: jest.fn() };
    command.$header = { hide: jest.fn() };

    command.stop();

    expect(command.$cn2.hide).toHaveBeenCalledTimes(1);
    expect(command.$header.hide).toHaveBeenCalledTimes(1);
  });
});
