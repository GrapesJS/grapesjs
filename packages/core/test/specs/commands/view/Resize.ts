import Resize, { ConvertUnitsToPx } from '../../../../src/commands/view/Resize';

describe('Resize command', () => {
  test('stop should blur the canvas resizer', () => {
    const command = new Resize({});
    const blur = jest.fn();
    command.canvasResizer = { blur } as any;

    command.stop();

    expect(blur).toHaveBeenCalledTimes(1);
  });

  test('convertPxToUnit should keep method name and convert pixels to percentage', () => {
    const command = new Resize({});
    const parent = document.createElement('div');
    Object.defineProperty(parent, 'offsetWidth', { configurable: true, value: 200 });
    const el = document.createElement('div');
    parent.appendChild(el);

    const result = command.convertPxToUnit({
      el,
      valuePx: 50,
      unit: ConvertUnitsToPx.perc,
      elComputedStyle: window.getComputedStyle(el),
    });

    expect(result).toBe('25%');
  });
});
