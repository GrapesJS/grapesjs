import Resize from '../../../../src/commands/view/Resize';
import type Resizer from '../../../../src/utils/Resizer';
import { setupTestEditor } from '../../../common';

describe('Resize command with canvas offsets', () => {
  let testEditor: ReturnType<typeof setupTestEditor>;
  let resizer: Resizer;

  beforeEach(() => {
    testEditor = setupTestEditor({ withCanvas: true, config: { avoidInlineStyle: false, forceClass: false } });
  });

  afterEach(() => {
    if (resizer?.docs) resizer.stop(new MouseEvent('pointerup') as PointerEvent);
    resizer?.blur();
    resizer?.container?.remove();
    jest.restoreAllMocks();
    testEditor.editor.destroy();
  });

  const setup = ({ zoom = 1, frameX = 140, frameY = -10, transformed = false, nested = false } = {}) => {
    const { editor, cmpRoot, fixtures } = testEditor;
    editor.setDragMode('absolute');
    const parent = cmpRoot.append({ style: { position: 'relative', width: '500px', height: '350px' } })[0];
    const container = nested ? parent.append({ tagName: 'section' })[0] : parent;
    const component = container.append({
      style: {
        position: 'absolute',
        left: '80px',
        top: '80px',
        width: '120px',
        height: '60px',
        transform: transformed ? 'translate(-50%, -50%)' : 'none',
      },
    })[0];
    fixtures.appendChild(cmpRoot.getEl()!);
    const parentEl = parent.getEl()!;
    const el = component.getEl()!;
    Object.defineProperty(el, 'offsetParent', { value: parentEl });
    Object.defineProperty(editor.Canvas.getBody(), 'offsetWidth', { value: 600 });
    jest.spyOn(editor.Canvas, 'getZoomDecimal').mockReturnValue(zoom);
    const canvasView = editor.Canvas.getCanvasView();
    const parentRect = { left: 50, top: 20, width: 500, height: 350 };
    jest.spyOn(canvasView, 'getCanvasOffset').mockReturnValue({ left: 30, top: 40, width: 1000, height: 600 });
    jest
      .spyOn(canvasView, 'getFrameOffset')
      .mockReturnValue({ left: 30 + frameX, top: 40 + frameY, width: 600, height: 450 });
    // jsdom has no layout engine. Mock element bounds while using the real canvas coordinate conversion.
    jest.spyOn(canvasView, 'offset').mockImplementation((target) => {
      if (target !== el) return { ...parentRect };
      const width = parseFloat(el.style.width);
      const height = parseFloat(el.style.height);
      return {
        left: parentRect.left + parseFloat(el.style.left) - (transformed ? width / 2 : 0),
        top: parentRect.top + parseFloat(el.style.top) - (transformed ? height / 2 : 0),
        width,
        height,
      };
    });
    const addStyle = jest.spyOn(component, 'addStyle');
    resizer = new Resize({}).run(editor, null, { component });
    fixtures.appendChild(resizer.container!);
    const resize = (handler: string, dx: number, dy: number) => {
      const target = resizer.handlers![handler]!;
      target.setPointerCapture = jest.fn();
      target.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
      document.body.dispatchEvent(
        new MouseEvent('pointermove', { clientX: dx * zoom, clientY: dy * zoom, bubbles: true }),
      );
      document.body.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
      return addStyle.mock.calls.at(-1)![0];
    };
    return { editor, component, resize };
  };

  test('preserves left/top when resizing the right edge in an offset canvas', () => {
    const { resize } = setup();
    expect(resize('cr', 20, 0)).toEqual({ left: '80px', top: '80px', width: '140px', __p: false });
  });

  test.each([
    ['tl', -20, -10, '60px', '70px', '140px', '70px'],
    ['tc', 0, -10, '80px', '70px', undefined, '70px'],
    ['tr', 20, -10, '80px', '70px', '140px', '70px'],
    ['cl', -20, 0, '60px', '80px', '140px', undefined],
    ['cr', 20, 0, '80px', '80px', '140px', undefined],
    ['bl', -20, 10, '60px', '80px', '140px', '70px'],
    ['bc', 0, 10, '80px', '80px', undefined, '70px'],
    ['br', 20, 10, '80px', '80px', '140px', '70px'],
  ] as const)('anchors the correct edges for %s at 50%% zoom', (handler, dx, dy, left, top, width, height) => {
    const { resize } = setup({ zoom: 0.5 });
    expect(resize(handler, dx, dy)).toEqual({
      left,
      top,
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
      __p: false,
    });
  });

  test.each([0.5, 1, 1.5, 2])('handles frame centering and zoom %s', (zoom) => {
    const { resize } = setup({ zoom, frameX: 240, frameY: 30 });
    expect(resize('cr', 20, 0)).toMatchObject({ left: '80px', top: '80px', width: '140px' });
  });

  test('preserves no-offset behavior', () => {
    const { resize } = setup({ frameX: 0, frameY: 0 });
    expect(resize('cr', 20, 0)).toMatchObject({ left: '80px', top: '80px', width: '140px' });
  });

  test('uses the positioned ancestor when it is not the direct parent', () => {
    const { resize } = setup({ nested: true });
    expect(resize('cr', 20, 0)).toMatchObject({ left: '80px', top: '80px', width: '140px' });
  });

  test('preserves translation correction', () => {
    const { resize } = setup({ transformed: true });
    expect(resize('cr', 20, 0)).toMatchObject({ left: '90px', top: '80px', width: '140px' });
  });

  test('undoes and redoes a resize', () => {
    const { editor, component, resize } = setup();
    editor.UndoManager.clear();
    resize('cr', 20, 0);
    expect(component.getStyle()).toMatchObject({ left: '80px', top: '80px', width: '140px' });
    editor.UndoManager.undo();
    expect(component.getStyle()).toMatchObject({ left: '80px', top: '80px', width: '120px' });
    expect(editor.UndoManager.hasUndo()).toBe(false);
    editor.UndoManager.redo();
    expect(component.getStyle()).toMatchObject({ left: '80px', top: '80px', width: '140px' });
  });
});
