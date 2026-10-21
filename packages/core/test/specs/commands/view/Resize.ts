import Resize, { ConvertUnitsToPx } from '../../../../src/commands/view/Resize';
import type { DragMode } from '../../../../src/dom_components/model/types';
import { ComponentsEvents } from '../../../../src/dom_components/types';
import type Resizer from '../../../../src/utils/Resizer';
import { setupTestEditor } from '../../../common';

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

  describe('position updates', () => {
    let resizer: Resizer;
    let testEditor: ReturnType<typeof setupTestEditor>;

    beforeEach(() => {
      testEditor = setupTestEditor({ withCanvas: true, config: { avoidInlineStyle: false, forceClass: false } });
    });

    afterEach(() => {
      if (resizer.docs) resizer.stop(new MouseEvent('pointerup') as PointerEvent);
      resizer.blur();
      resizer.container?.remove();
      jest.restoreAllMocks();
      testEditor.editor.destroy();
    });

    const setup = ({
      transform = 'translate(-50%, -50%)',
      translate = '',
      ratioX = -0.5,
      ratioY = -0.5,
      offsetX = 0,
      offsetY = 0,
      skipPositionUpdate = false,
      dragMode = 'absolute' as DragMode,
      unitWidth = 'px',
    } = {}) => {
      const { editor, cmpRoot, fixtures } = testEditor;
      editor.setDragMode(dragMode);
      const parentComponent = cmpRoot.append({ style: { position: 'relative', width: '1000px', height: '500px' } })[0];
      const component = parentComponent.append({
        style: {
          position: 'absolute',
          left: '450px',
          top: '150px',
          width: unitWidth === '%' ? '42%' : '420px',
          height: '60px',
          transform,
          ...(translate ? { translate } : {}),
          color: 'red !important',
        },
      })[0];
      fixtures.appendChild(cmpRoot.getEl()!);
      const parent = parentComponent.getEl()!;
      const el = component.getEl()!;
      Object.defineProperty(el, 'offsetParent', { value: parent });
      const parentRect = { left: 100, top: 80, width: 1000, height: 500 };
      Object.defineProperty(parent, 'offsetWidth', { value: parentRect.width });
      const getElementPos = (target: HTMLElement) => {
        if (target !== el) return { ...parentRect, zoom: 1, rect: parentRect };
        // jsdom has no layout engine. Model the browser's used bounds for translations.
        const width = parseFloat(el.style.width) * (el.style.width.endsWith('%') ? parentRect.width / 100 : 1);
        const height = parseFloat(el.style.height);
        const rect = {
          left: parentRect.left + parseFloat(el.style.left) + width * ratioX + offsetX,
          top: parentRect.top + parseFloat(el.style.top) + height * ratioY + offsetY,
          width,
          height,
        };
        return { ...rect, zoom: 1, rect };
      };
      jest.spyOn(editor.Canvas.getCanvasView(), 'getElementPos').mockImplementation(getElementPos);
      Object.defineProperty(editor.Canvas.getBody(), 'offsetWidth', { value: 1000 });
      const addStyle = jest.spyOn(component, 'addStyle');
      const trigger = jest.spyOn(editor, 'trigger');
      const command = new Resize({});
      resizer = command.run(editor, null, { component, skipPositionUpdate });
      fixtures.appendChild(resizer.container!);
      const resize = (handler: string, x: number, y: number, store = false) => {
        const target = resizer.handlers![handler]!;
        target.setPointerCapture = jest.fn();
        target.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
        document.body.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
        if (store) document.body.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
        return addStyle.mock.calls.at(-1)![0];
      };
      return { el, editor, component, resize, addStyle, trigger };
    };

    test.each([
      ['cl', -50, 0, '425px', '150px', '470px', undefined],
      ['cr', 50, 0, '475px', '150px', '470px', undefined],
      ['tc', 0, -20, '450px', '140px', undefined, '80px'],
      ['bc', 0, 20, '450px', '160px', undefined, '80px'],
      ['tl', -50, -20, '425px', '140px', '470px', '80px'],
      ['br', 50, 20, '475px', '160px', '470px', '80px'],
    ] as const)(
      'anchors the opposite edge for percentage translation with %s',
      (handler, x, y, left, top, width, height) => {
        const { el, component, resize, addStyle, editor, trigger } = setup();
        const inlineStyle = el.style.cssText;
        let inlineStyleAtUpdate = '';
        editor.once(ComponentsEvents.resizeUpdate, () => (inlineStyleAtUpdate = el.style.cssText));
        const style = resize(handler, x, y, true);

        expect(style).toEqual({ left, top, ...(width ? { width } : {}), ...(height ? { height } : {}), __p: false });
        expect(component.getStyle()).toMatchObject({
          left,
          top,
          ...(width ? { width } : {}),
          ...(height ? { height } : {}),
        });
        expect(inlineStyleAtUpdate).toBe(inlineStyle);
        expect(el.style.getPropertyPriority('color')).toBe('important');
        expect(el.style.transform).toBe('translate(-50%, -50%)');
        expect(addStyle).toHaveBeenCalledTimes(2);
        expect(addStyle.mock.calls[0][1]).toMatchObject({ avoidStore: true });
        expect(addStyle.mock.calls[1][1]).toMatchObject({ avoidStore: false });
        const update = trigger.mock.calls.find(([name]) => name === ComponentsEvents.resizeUpdate)!;
        expect(update[1].style).toMatchObject({ left, top });
      },
    );

    test('preserves fixed translations', () => {
      const { resize } = setup({
        transform: 'translate(30px, -20px)',
        ratioX: 0,
        ratioY: 0,
        offsetX: 30,
        offsetY: -20,
      });
      expect(resize('tl', -50, -20)).toMatchObject({ left: '400px', top: '130px', width: '470px', height: '80px' });
    });

    test('resolves percentage width before measuring the translation', () => {
      const { resize } = setup({ unitWidth: '%' });
      expect(resize('cl', -50, 0)).toMatchObject({ left: '425px', top: '150px', width: '47%' });
    });

    test('uses the original bounds across successive moves and the final update', () => {
      const { el, component, resize, addStyle } = setup();
      resize('cl', -50, 0);
      document.body.dispatchEvent(new MouseEvent('pointermove', { clientX: -100, bubbles: true }));
      document.body.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));

      expect(addStyle.mock.calls.at(-1)![0]).toEqual({ left: '400px', top: '150px', width: '520px', __p: false });
      expect(component.getStyle()).toMatchObject({ left: '400px', top: '150px', width: '520px' });
      expect(el.style.transform).toBe('translate(-50%, -50%)');
    });

    test('supports the individual translate property', () => {
      const { resize } = setup({ transform: 'none', translate: '-50% -50%' });
      expect(resize('cl', -50, 0)).toMatchObject({ left: '425px', top: '150px', width: '470px' });
    });

    test('undoes and redoes a completed resize in one step', () => {
      const { editor, component, resize } = setup();
      const { UndoManager } = editor;
      UndoManager.clear();

      resize('cl', -50, 0, true);
      expect(component.getStyle()).toMatchObject({ left: '425px', width: '470px' });
      UndoManager.undo();
      expect(component.getStyle()).toMatchObject({ left: '450px', width: '420px' });
      expect(UndoManager.hasUndo()).toBe(false);
      UndoManager.redo();
      expect(component.getStyle()).toMatchObject({ left: '425px', width: '470px' });
    });

    test('keeps untransformed positioning unchanged', () => {
      const { resize } = setup({ transform: 'none', ratioX: 0, ratioY: 0 });
      expect(resize('cl', -50, 0)).toMatchObject({ left: '400px', top: '150px', width: '470px' });
    });

    test.each([{ skipPositionUpdate: true }, { dragMode: '' }] as const)(
      'respects position update options %j',
      (options) => {
        const { resize } = setup(options);
        expect(resize('cl', -50, 0)).toEqual({ width: '470px', __p: true });
      },
    );
  });
});
