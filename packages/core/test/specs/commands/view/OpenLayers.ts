import OpenLayers from '../../../../src/commands/view/OpenLayers';

describe('OpenLayers command', () => {
  test('should show layers container when opened', () => {
    const command = new OpenLayers({});
    const panelTrigger = jest.fn();
    const panel = { set: jest.fn(() => ({ trigger: panelTrigger })) };
    const render = jest.fn(() => document.createElement('div'));
    const editor = {
      LayerManager: {
        getConfig: jest.fn(() => ({})),
        render,
      },
      Panels: {
        getPanel: jest.fn(() => panel),
        addPanel: jest.fn(),
      },
    } as any;

    command.run(editor);

    expect(panel.set).toHaveBeenCalled();
    expect(command.layers?.style.display).toBe('block');
  });

  test('stop should hide layers container', () => {
    const command = new OpenLayers({});
    command.layers = document.createElement('div');
    command.layers.style.display = 'block';

    command.stop();

    expect(command.layers.style.display).toBe('none');
  });
});
