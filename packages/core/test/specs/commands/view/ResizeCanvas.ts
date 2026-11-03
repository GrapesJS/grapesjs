import Resize from '../../../../src/commands/view/Resize';
import type { DragMode } from '../../../../src/dom_components/model/types';
import { ComponentsEvents } from '../../../../src/dom_components/types';
import type Resizer from '../../../../src/utils/Resizer';
import { setupTestEditor } from '../../../common';

describe('Resize command on canvas', () => {
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

  const setup = ({
    position = 'absolute',
    left = 80,
    top = 80,
    zoom = 1,
    frameX = 140,
    frameY = -10,
    transformed = false,
    svg = false,
    nested = false,
    unitWidth = 'px',
    positionedParent = true,
    parentStyle = {} as Record<string, string>,
    wrapperStyle = {} as Record<string, string>,
    skipPositionUpdate = false,
    dragMode = 'absolute' as DragMode,
    parentRect = { left: 50, top: 20, width: 500, height: 350 },
  } = {}) => {
    const { editor, cmpRoot, fixtures } = testEditor;
    const isRelative = position === 'relative';
    editor.setDragMode(dragMode);
    const parent = cmpRoot.append({
      style: {
        ...(positionedParent ? { position: 'relative' } : {}),
        ...(isRelative ? { display: 'flex', 'justify-content': 'center', 'align-items': 'center' } : {}),
        width: `${parentRect.width}px`,
        height: `${parentRect.height}px`,
        ...parentStyle,
      },
    })[0];
    const container = nested ? parent.append({ tagName: 'section', style: wrapperStyle })[0] : parent;
    const component = container.append({
      ...(svg ? { type: 'svg', attributes: { viewBox: '0 0 120 60' } } : {}),
      style: {
        position,
        left: `${left}px`,
        top: `${top}px`,
        width: unitWidth === '%' ? `${(120 / parentRect.width) * 100}%` : '120px',
        height: '60px',
        transform: transformed ? 'translate(-50%, -50%)' : 'none',
        color: 'red !important',
      },
    })[0];
    fixtures.appendChild(cmpRoot.getEl()!);
    const parentEl = parent.getEl()!;
    const el = component.getEl()!;
    if (!svg)
      Object.defineProperty(el, 'offsetParent', { value: positionedParent ? parentEl : editor.Canvas.getBody() });
    Object.defineProperty(parentEl, 'offsetWidth', { value: parentRect.width });
    Object.defineProperty(editor.Canvas.getBody(), 'offsetWidth', { value: 600 });
    jest.spyOn(editor.Canvas, 'getZoomDecimal').mockReturnValue(zoom);
    const canvasView = editor.Canvas.getCanvasView();
    jest.spyOn(canvasView, 'getCanvasOffset').mockReturnValue({ left: 30, top: 40, width: 1000, height: 600 });
    jest
      .spyOn(canvasView, 'getFrameOffset')
      .mockReturnValue({ left: 30 + frameX, top: 40 + frameY, width: 600, height: 450 });
    // jsdom has no layout engine. Model bounds while using the real canvas coordinate conversion.
    jest.spyOn(canvasView, 'offset').mockImplementation((target) => {
      if (target !== el) return { ...parentRect };
      const width = parseFloat(el.style.width) * (el.style.width.endsWith('%') ? parentRect.width / 100 : 1);
      const height = parseFloat(el.style.height);
      const layoutLeft = isRelative ? (parentRect.width - width) / 2 : 0;
      const layoutTop = isRelative ? (parentRect.height - height) / 2 : 0;
      return {
        left: parentRect.left + layoutLeft + parseFloat(el.style.left) - (transformed ? width / 2 : 0),
        top: parentRect.top + layoutTop + parseFloat(el.style.top) - (transformed ? height / 2 : 0),
        width,
        height,
      };
    });
    const addStyle = jest.spyOn(component, 'addStyle');
    resizer = new Resize({}).run(editor, null, { component, skipPositionUpdate });
    fixtures.appendChild(resizer.container!);
    const before = { ...canvasView.offset(el) };
    const move = (dx: number, dy = 0) => {
      document.body.dispatchEvent(
        new MouseEvent('pointermove', { clientX: dx * zoom, clientY: dy * zoom, bubbles: true }),
      );
    };
    const stop = () => document.body.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    const resize = (handler = 'cr', dx = 20, dy = 0, store = true) => {
      const target = resizer.handlers![handler]!;
      target.setPointerCapture = jest.fn();
      target.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
      move(dx, dy);
      if (store) stop();
      return { update: addStyle.mock.calls.at(-1)![0], style: component.getStyle(), rect: canvasView.offset(el) };
    };
    return {
      editor,
      component,
      el,
      before,
      resize,
      canvasView,
      move,
      stop,
      resizer,
      parentEl,
      containerEl: container.getEl()!,
    };
  };

  describe('absolute children with canvas offsets', () => {
    test('preserves left/top when resizing the right edge in an offset canvas', () => {
      const { resize } = setup();
      expect(resize('cr', 20, 0).update).toEqual({ left: '80px', top: '80px', width: '140px', __p: false });
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
      expect(resize(handler, dx, dy).update).toEqual({
        left,
        top,
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        __p: false,
      });
    });

    test.each([0.5, 1, 1.5, 2])('handles frame centering and zoom %s', (zoom) => {
      const { resize } = setup({ zoom, frameX: 240, frameY: 30 });
      expect(resize('cr', 20, 0).update).toMatchObject({ left: '80px', top: '80px', width: '140px' });
    });

    test('preserves no-offset behavior', () => {
      const { resize } = setup({ frameX: 0, frameY: 0 });
      expect(resize('cr', 20, 0).update).toMatchObject({ left: '80px', top: '80px', width: '140px' });
    });

    test('uses the positioned ancestor when it is not the direct parent', () => {
      const { resize } = setup({ nested: true });
      expect(resize('cr', 20, 0).update).toMatchObject({ left: '80px', top: '80px', width: '140px' });
    });

    test('preserves translation correction', () => {
      const { resize } = setup({ transformed: true });
      expect(resize('cr', 20, 0).update).toMatchObject({ left: '90px', top: '80px', width: '140px' });
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

  describe('absolutely positioned SVG roots', () => {
    const setupSvg = (options: Parameters<typeof setup>[0] = {}) =>
      setup({ svg: true, frameX: 0, frameY: 0, ...options });

    test('preserves CSS left/top without an offsetParent or canvas offset', () => {
      const { el, before, resize } = setupSvg({ parentRect: { left: 37.25, top: 20, width: 500, height: 350 } });
      expect(el.namespaceURI).toBe('http://www.w3.org/2000/svg');
      expect(el.offsetParent).toBeUndefined();
      expect(before).toMatchObject({ left: 117.25, top: 100, width: 120, height: 60 });
      const after = resize();
      expect(after.style).toMatchObject({ left: '80px', top: '80px', width: '140px' });
      expect(after.rect).toMatchObject({ left: before.left, top: before.top });
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
    ] as const)('anchors the correct edges for %s', (handler, dx, dy, left, top, width, height) => {
      const { resize } = setupSvg();
      expect(resize(handler, dx, dy).update).toEqual({
        left,
        top,
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        __p: false,
      });
    });

    test('finds the positioned ancestor through a static HTML wrapper', () => {
      const { resize } = setupSvg({ nested: true });
      expect(resize().style).toMatchObject({ left: '80px', top: '80px', width: '140px' });
    });

    test.each([0.5, 1, 2])('handles canvas offset and zoom %s', (zoom) => {
      const { resize } = setupSvg({ zoom, frameX: 140, frameY: -10 });
      expect(resize().style).toMatchObject({ left: '80px', top: '80px', width: '140px' });
    });

    test('preserves SVG translation correction', () => {
      const { resize } = setupSvg({ transformed: true });
      expect(resize().style).toMatchObject({ left: '90px', top: '80px', width: '140px' });
    });

    test('keeps the zero origin when no positioned ancestor exists', () => {
      const { resizer } = setupSvg({ positionedParent: false });
      expect(resizer.getParentRect()).toEqual({ left: 0, top: 0, width: 0, height: 0 });
    });

    test.each<Record<string, string>>([
      { position: 'relative' },
      { position: 'absolute' },
      { position: 'fixed' },
      { position: 'sticky' },
      { transform: 'translate(0px, 0px)' },
      { translate: '0px 0px' },
      { rotate: '0deg' },
      { scale: '1' },
      { perspective: '1000px' },
      { 'transform-style': 'preserve-3d' },
      { filter: 'blur(0px)' },
      { contain: 'layout' },
      { contain: 'paint' },
      { contain: 'strict' },
      { contain: 'content' },
      { 'content-visibility': 'auto' },
      { 'will-change': 'transform' },
      { 'will-change': 'opacity, perspective' },
      { 'will-change': 'transform-style' },
    ])('resolves the containing ancestor with %j', (parentStyle) => {
      const { resizer } = setupSvg({ positionedParent: false, parentStyle });
      expect(resizer.getParentRect()).toMatchObject({ left: 50, top: 20, width: 500, height: 350 });
    });

    test.each<Record<string, string>>([
      { position: 'static' },
      { 'will-change': 'opacity' },
      { contain: 'size' },
      { contain: 'style' },
      { transform: 'none' },
      { 'transform-style': 'flat' },
      { display: 'contents', position: 'relative' },
    ])('does not treat %j as a containing ancestor', (parentStyle) => {
      const { resizer } = setupSvg({ positionedParent: false, parentStyle });
      expect(resizer.getParentRect()).toEqual({ left: 0, top: 0, width: 0, height: 0 });
    });

    test('uses the nearest containing wrapper rather than the outer positioned parent', () => {
      const { resizer, canvasView, containerEl } = setupSvg({ nested: true, wrapperStyle: { position: 'relative' } });
      const offset = jest.mocked(canvasView.offset).getMockImplementation()!;
      jest
        .mocked(canvasView.offset)
        .mockImplementation((el, opts) =>
          el === containerEl ? { left: 90, top: 50, width: 300, height: 200 } : offset(el, opts),
        );
      expect(resizer.getParentRect()).toMatchObject({ left: 90, top: 50, width: 300, height: 200 });
    });

    test('keeps fixed SVG coordinates relative to the viewport when ancestors are only positioned', () => {
      const { resizer } = setupSvg({ position: 'fixed' });
      expect(resizer.getParentRect()).toEqual({ left: 0, top: 0, width: 0, height: 0 });
    });

    test('resolves a transformed containing ancestor for a fixed SVG', () => {
      const { resizer } = setupSvg({ position: 'fixed', parentStyle: { transform: 'translate(0px, 0px)' } });
      expect(resizer.getParentRect()).toMatchObject({ left: 50, top: 20, width: 500, height: 350 });
    });

    test('preserves a native null offsetParent for a fixed HTML element', () => {
      const { resizer, parentEl } = setupSvg();
      const htmlEl = document.createElement('div');
      htmlEl.style.position = 'fixed';
      parentEl.appendChild(htmlEl);
      expect(htmlEl.offsetParent).toBeNull();
      resizer.el = htmlEl;
      expect(resizer.getParentRect()).toEqual({ left: 0, top: 0, width: 0, height: 0 });
    });
  });

  describe('relatively positioned flex children', () => {
    const setupRelative = (options: Parameters<typeof setup>[0] = {}) =>
      setup({
        position: 'relative',
        left: 0,
        top: 0,
        frameX: 0,
        frameY: 0,
        parentRect: { left: 40, top: 130, width: 400, height: 100 },
        ...options,
      });

    test.each([
      ['tl', -20, -10, -20, -10, 140, 70, '-10px', '-5px'],
      ['tc', 0, -10, 0, -10, 120, 70, '0px', '-5px'],
      ['tr', 20, -10, 0, -10, 140, 70, '10px', '-5px'],
      ['cl', -20, 0, -20, 0, 140, 60, '-10px', '0px'],
      ['cr', 20, 0, 0, 0, 140, 60, '10px', '0px'],
      ['bl', -20, 10, -20, 0, 140, 70, '-10px', '5px'],
      ['bc', 0, 10, 0, 0, 120, 70, '0px', '5px'],
      ['br', 20, 10, 0, 0, 140, 70, '10px', '5px'],
    ] as const)('anchors the opposite edge with %s', (handler, dx, dy, offsetX, offsetY, width, height, left, top) => {
      const { before, resize } = setupRelative();
      const after = resize(handler, dx, dy);
      expect(after.style).toMatchObject({
        position: 'relative',
        left,
        top,
        width: `${width}px`,
        height: `${height}px`,
      });
      expect(after.rect).toMatchObject({ left: before.left + offsetX, top: before.top + offsetY, width, height });
    });

    test.each([0.5, 1, 1.5, 2])('handles canvas offset and zoom %s', (zoom) => {
      const { before, resize } = setupRelative({ frameX: 140, frameY: -10, zoom });
      const after = resize();
      expect(after.style).toMatchObject({ left: '10px', top: '0px', width: '140px' });
      expect(after.rect).toMatchObject({ left: before.left, top: before.top });
    });

    test('accounts for existing relative offsets', () => {
      const { before, resize } = setupRelative({ left: 10, top: -5 });
      const after = resize();
      expect(after.style).toMatchObject({ left: '20px', top: '-5px', width: '140px' });
      expect(after.rect).toMatchObject({ left: before.left, top: before.top });
    });

    test('resolves percentage widths before measuring flex layout', () => {
      const { before, resize } = setupRelative({ unitWidth: '%' });
      const after = resize();
      expect(after.style).toMatchObject({ left: '10px', top: '0px', width: '35%' });
      expect(after.rect).toMatchObject({ left: before.left, top: before.top, width: 140 });
    });

    test('combines relative positioning with translations', () => {
      const { before, resize } = setupRelative({ transformed: true });
      const after = resize();
      expect(after.style).toMatchObject({ left: '20px', top: '0px', width: '140px' });
      expect(after.rect).toMatchObject({ left: before.left, top: before.top });
    });

    test('works without a positioned parent', () => {
      const { before, resize } = setupRelative({ positionedParent: false });
      const after = resize();
      expect(after.style).toMatchObject({ left: '10px', top: '0px', width: '140px' });
      expect(after.rect).toMatchObject({ left: before.left, top: before.top });
    });

    test('restores inline styles before publishing a resize update', () => {
      const { el, editor, resize } = setupRelative();
      const originalStyle = el.style.cssText;
      let atUpdate = '';
      editor.once(ComponentsEvents.resizeUpdate, () => (atUpdate = el.style.cssText));
      resize();
      expect(atUpdate).toBe(originalStyle);
      expect(el.style.getPropertyPriority('color')).toBe('important');
    });

    test('anchors the original bounds across successive moves', () => {
      const { before, component, resize, canvasView, el, move, stop } = setupRelative();
      resize('cr', 20, 0, false);
      move(40);
      stop();
      expect(component.getStyle()).toMatchObject({ left: '20px', top: '0px', width: '160px' });
      expect(canvasView.offset(el)).toMatchObject({ left: before.left, top: before.top });
    });

    test('undoes and redoes the whole resize in one step', () => {
      const { editor, component, resize } = setupRelative();
      editor.UndoManager.clear();
      resize();
      expect(component.getStyle()).toMatchObject({ left: '10px', top: '0px', width: '140px' });
      editor.UndoManager.undo();
      expect(component.getStyle()).toMatchObject({ left: '0px', top: '0px', width: '120px' });
      expect(editor.UndoManager.hasUndo()).toBe(false);
      editor.UndoManager.redo();
      expect(component.getStyle()).toMatchObject({ left: '10px', top: '0px', width: '140px' });
    });

    test.each([{ skipPositionUpdate: true }, { dragMode: '' }] as const)(
      'respects position update options %j',
      (options) => {
        const { resize } = setupRelative(options);
        const after = resize();
        expect(after.style).toMatchObject({ left: '0px', top: '0px', width: '140px' });
        expect(after.rect).toMatchObject({ left: 170, top: 150 });
      },
    );
  });
});
