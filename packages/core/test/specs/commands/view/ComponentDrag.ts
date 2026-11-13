import ComponentDrag from '../../../../src/commands/view/ComponentDrag';
import ToolbarButton from '../../../../src/dom_components/model/ToolbarButton';
import ToolbarButtonView from '../../../../src/dom_components/view/ToolbarButtonView';
import type Dragger from '../../../../src/utils/Dragger';
import { setupTestEditor } from '../../../common';

describe('ComponentDrag command', () => {
  test('getTranslate should extract axis values from transform', () => {
    const command = new ComponentDrag({});

    expect(command.getTranslate('translateX(10px) translateY(20px)')).toBe(10);
    expect(command.getTranslate('translateX(10px) translateY(20px)', 'y')).toBe(20);
  });

  test('setTranslate should update and append translate values', () => {
    const command = new ComponentDrag({});

    expect(command.setTranslate('translateX(10px)', 'x', '15px')).toContain('translateX(15px)');
    expect(command.setTranslate('translateX(10px)', 'y', '20px')).toContain('translateY(20px)');
  });

  test('run should require target option', () => {
    const command = new ComponentDrag({});

    expect(() => command.run({} as any, null, {} as any)).toThrow('Target option is required');
  });
});

describe.each([false, true])('ComponentDrag with CSS positioning (avoidInlineStyle: %s)', (avoidInlineStyle) => {
  let testEditor: ReturnType<typeof setupTestEditor>;
  let dragger: Dragger | undefined;
  let toolbar: ToolbarButtonView | undefined;

  beforeEach(() => {
    testEditor = setupTestEditor({ withCanvas: true, config: { avoidInlineStyle, forceClass: false } });
  });

  afterEach(() => {
    dragger?.stop(new MouseEvent('mouseup'));
    dragger = undefined;
    toolbar?.remove();
    toolbar = undefined;
    jest.restoreAllMocks();
    testEditor.editor.destroy();
  });

  const setup = ({
    parentLeft = 70,
    position = 'absolute',
    nested = false,
    modelPosition = false,
    modelStyle = {} as Record<string, string>,
  } = {}) => {
    const { editor, em, cmpRoot } = testEditor;
    const parent = cmpRoot.append({ classes: ['artboard'] })[0];
    const container = nested ? parent.append({})[0] : parent;
    const component = container.append({
      classes: ['box'],
      ...(modelPosition ? { style: { position } } : {}),
    })[0];
    editor.Canvas.getBody().appendChild(cmpRoot.getEl()!);
    const el = component.getEl()!;
    const doc = el.ownerDocument;
    const css = doc.createElement('style');
    css.textContent = `
      .artboard { position: relative; }
      .box { position: ${position}; left: 80px; top: 60px; width: 120px; height: 60px; }
    `;
    doc.head.appendChild(css);
    component.addStyle(modelStyle);
    const command = editor.Commands.get('core:component-drag') as ComponentDrag;
    jest.spyOn(command, 'getGuidesStatic').mockReturnValue([]);
    jest.spyOn(command, 'getGuidesTarget').mockReturnValue([]);
    // JSDOM resolves CSS but has no layout engine. Only mock the element bounds.
    jest.spyOn(editor.Canvas, 'offset').mockImplementation((target) => ({
      left: parentLeft + (target === el ? 80 : 0),
      top: 40 + (target === el ? 60 : 0),
      width: target === el ? 120 : 500,
      height: target === el ? 60 : 350,
    }));
    const pointer = (type: string, dx = 0, dy = 0) => {
      const event = new MouseEvent(type, { clientX: 200 + dx, clientY: 150 + dy, bubbles: true, buttons: 1 });
      Object.defineProperty(event, 'which', { value: 1 });
      return event;
    };
    const start = (event: Event) => {
      dragger = editor.runCommand('core:component-drag', {
        target: component,
        event,
        skipGuidesRender: true,
      }) as Dragger;
    };
    toolbar = new ToolbarButtonView({
      config: { em },
      model: new ToolbarButton({ command: (_editor, _sender, options) => start(options.event) }),
    });
    return {
      component,
      parent,
      start: (source: 'direct' | 'toolbar') => {
        if (source === 'toolbar') toolbar!.handleClick(pointer('mousedown'));
        else start(pointer('dragstart'));
      },
      move: (dx: number, dy = 0) => el.dispatchEvent(pointer('mousemove', dx, dy)),
      stop: () => doc.dispatchEvent(pointer('mouseup')),
    };
  };

  test.each([
    ['direct', 70],
    ['toolbar', 70],
    ['direct', 0],
    ['toolbar', 0],
  ] as const)('%s drag preserves class-based coordinates with parent offset %s', (source, parentLeft) => {
    const { component, parent, start, move, stop } = setup({ parentLeft });
    expect(component.getStyle()).toEqual({});
    expect(parent.getStyle()).toEqual({});

    start(source);
    expect(component.getStyle()).toMatchObject({ left: '80px', top: '60px' });
    move(25, 15);
    stop();
    expect(component.getStyle()).toMatchObject({ left: '105px', top: '75px' });

    start(source);
    move(25, 15);
    stop();
    expect(component.getStyle()).toMatchObject({ left: '130px', top: '90px' });
  });

  test('uses CSS coordinates when only position is stored in the model', () => {
    const { component, start, move } = setup({ modelPosition: true });
    start('direct');
    move(25, 15);
    expect(component.getStyle()).toMatchObject({ left: '105px', top: '75px' });
  });

  test.each([
    ['direct', '10%', '10%', 50, 35],
    ['toolbar', '10%', '10%', 50, 35],
    ['direct', '5em', '3.75em', 80, 60],
    ['toolbar', '5em', '3.75em', 80, 60],
  ] as const)('%s drag resolves model offsets %s / %s to pixels', (source, left, top, x, y) => {
    const { component, start, move, stop } = setup({
      modelStyle: { position: 'absolute', left, top, width: '2.5in', height: '5cm' },
    });
    const el = component.getEl()!;
    const win = el.ownerDocument.defaultView!;
    const getComputedStyle = win.getComputedStyle.bind(win);
    // JSDOM does not resolve relative units to used pixel values as browsers do.
    jest.spyOn(win, 'getComputedStyle').mockImplementation((target) => {
      const style = getComputedStyle(target);
      if (target === el) {
        if (style.left === left) style.left = `${x}px`;
        if (style.top === top) style.top = `${y}px`;
      }
      return style;
    });

    start(source);
    expect(component.getStyle()).toMatchObject({ left: `${x}px`, top: `${y}px` });
    move(25, 15);
    stop();
    expect(component.getStyle()).toMatchObject({
      left: `${x + 25}px`,
      top: `${y + 15}px`,
      width: '2.5in',
      height: '5cm',
    });

    start(source);
    move(25, 15);
    stop();
    expect(component.getStyle()).toMatchObject({ left: `${x + 50}px`, top: `${y + 30}px` });
  });

  test.each([false, true])('converts to absolute relative to a class-positioned ancestor (nested: %s)', (nested) => {
    const { component, start, move } = setup({ position: 'relative', nested });
    start('direct');
    move(25, 15);
    expect(component.getStyle()).toMatchObject({ position: 'absolute', left: '105px', top: '75px' });
  });
});
