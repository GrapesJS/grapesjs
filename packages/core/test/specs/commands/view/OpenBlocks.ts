import OpenBlocks from '../../../../src/commands/view/OpenBlocks';

describe('OpenBlocks command', () => {
  test('open should show the container', () => {
    const command = new OpenBlocks({});
    const panels = {
      getPanel: jest.fn(() => ({ set: jest.fn(() => ({ trigger: jest.fn() })) })),
      addPanel: jest.fn(),
    };

    command.container = document.createElement('div');
    command.editor = { Panels: panels } as any;
    command.bm = { render: jest.fn(() => document.createElement('div')) };
    command.config = { custom: false, appendTo: '' };
    command.firstRender = false;

    command.open();

    expect(command.container.style.display).toBe('block');
  });

  test('stop should hide the container', () => {
    const command = new OpenBlocks({});
    command.container = document.createElement('div');
    command.container.style.display = 'block';
    command.bm = { __customData: jest.fn() };
    command.config = { custom: false };

    command.stop();

    expect(command.container.style.display).toBe('none');
  });
});
