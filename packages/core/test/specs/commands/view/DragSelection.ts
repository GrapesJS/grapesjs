import ComponentDrag from '../../../../src/commands/view/ComponentDrag';
import SelectComponent from '../../../../src/commands/view/SelectComponent';
import ToolbarButton from '../../../../src/dom_components/model/ToolbarButton';
import ToolbarButtonView from '../../../../src/dom_components/view/ToolbarButtonView';
import { setupTestEditor } from '../../../common';

describe('Selection after dragging', () => {
  let testEditor: ReturnType<typeof setupTestEditor>;
  let selectCommand: SelectComponent;
  let toolbar: ToolbarButtonView | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    testEditor = setupTestEditor({ withCanvas: true });
    selectCommand = testEditor.editor.Commands.get('core:component-select') as SelectComponent;
    // Tool positioning and resize handles are unrelated to click selection.
    jest.spyOn(selectCommand, 'onSelect').mockImplementation(() => {});
    jest.spyOn(selectCommand, 'initResize').mockImplementation(() => {});
  });

  afterEach(() => {
    toolbar?.remove();
    toolbar = undefined;
    testEditor.editor.destroy();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const pointer = (type: string) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, buttons: 1, clientX: 100, clientY: 100 });
    Object.defineProperty(event, 'which', { value: 1 });
    return event;
  };

  const setup = (mode: 'absolute' | 'translate' = 'absolute', source: 'direct' | 'toolbar' = 'direct') => {
    const { editor, em, cmpRoot } = testEditor;
    editor.setDragMode(mode);
    const [a, b] = cmpRoot.append([
      { attributes: { id: 'box-a' }, style: { position: 'absolute', left: '0px', top: '0px' } },
      { attributes: { id: 'box-b' } },
    ]);
    editor.Canvas.getBody().appendChild(cmpRoot.getEl()!);
    editor.select(a);
    em.runDefault();
    const dragCommand = editor.Commands.get('core:component-drag') as ComponentDrag;
    jest.spyOn(dragCommand, 'getGuidesStatic').mockReturnValue([]);
    jest.spyOn(dragCommand, 'getGuidesTarget').mockReturnValue([]);

    if (source === 'toolbar') {
      toolbar = new ToolbarButtonView({ config: { em }, model: new ToolbarButton({ command: 'tlb-move' }) });
      toolbar.handleClick(pointer('mousedown'));
    } else {
      a.getEl()!.dispatchEvent(pointer('dragstart'));
    }
    // Direct dragging defers stopping the selection command until after dragstart.
    jest.advanceTimersByTime(0);

    const body = editor.Canvas.getBody();
    const finish = (cancel = false) => {
      if (cancel) dragCommand.dragger!.stop(new KeyboardEvent('keydown', { key: 'Escape' }), { cancel: true });
      else body.dispatchEvent(pointer('mouseup'));
      jest.advanceTimersByTime(0);
    };
    const click = (el: HTMLElement) => {
      el.dispatchEvent(pointer('pointerdown'));
      el.dispatchEvent(pointer('mousedown'));
      el.dispatchEvent(pointer('mouseup'));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
    };
    return { a, b, dropTarget: cmpRoot.getEl()!, finish, click };
  };

  test.each([
    ['absolute', 'direct'],
    ['absolute', 'toolbar'],
    ['translate', 'direct'],
    ['translate', 'toolbar'],
  ] as const)('first click selects another component after %s %s dragging', (mode, source) => {
    const { b, finish, click } = setup(mode, source);
    finish();
    click(b.getEl()!);
    expect(testEditor.editor.getSelected()?.getId()).toBe(b.getId());
  });

  test('first click selects a component after outside deselection', () => {
    const { b, finish, click } = setup('absolute', 'toolbar');
    finish();
    testEditor.editor.selectRemove(testEditor.editor.getSelectedAll());
    expect(testEditor.editor.getSelected()).toBeUndefined();
    click(b.getEl()!);
    expect(testEditor.editor.getSelected()?.getId()).toBe(b.getId());
  });

  test('first click selects another component after a cancelled drag', () => {
    const { b, finish, click } = setup();
    finish(true);
    click(b.getEl()!);
    expect(testEditor.editor.getSelected()?.getId()).toBe(b.getId());
  });

  test.each([false, true])(
    'a drop click without a new pointer gesture preserves the dragged selection (cancelled: %s)',
    (cancelled) => {
      const { a, dropTarget, finish } = setup();
      finish(cancelled);
      dropTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
      expect(testEditor.editor.getSelected()?.getId()).toBe(a.getId());
    },
  );

  test('a child stopping pointerdown propagation does not consume the next click', () => {
    const { b, finish, click } = setup();
    finish();
    b.getEl()!.addEventListener('pointerdown', (event) => event.stopPropagation());
    click(b.getEl()!);
    expect(testEditor.editor.getSelected()?.getId()).toBe(b.getId());
  });

  test('stopping selection detaches the pointerdown handler', () => {
    const { a, b, finish, click } = setup();
    const { editor, em } = testEditor;
    finish();
    em.stopDefault({ preserveSelected: true });
    click(b.getEl()!);
    expect(editor.getSelected()?.getId()).toBe(a.getId());
    expect(em.get('_cmpDrag')).toBe(1);

    em.runDefault({ preserveSelected: true });
    click(b.getEl()!);
    expect(editor.getSelected()?.getId()).toBe(b.getId());
  });
});
