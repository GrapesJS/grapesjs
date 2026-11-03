import ComponentDrag from '../../../../src/commands/view/ComponentDrag';
import ToolbarButton from '../../../../src/dom_components/model/ToolbarButton';
import ToolbarButtonView from '../../../../src/dom_components/view/ToolbarButtonView';
import type Dragger from '../../../../src/utils/Dragger';
import { setupTestEditor } from '../../../common';

describe('Toolbar drag with canvas zoom', () => {
  let testEditor: ReturnType<typeof setupTestEditor>;
  let toolbar: ToolbarButtonView;
  let command: ComponentDrag;
  let dragger: Dragger;

  beforeEach(() => {
    testEditor = setupTestEditor({ withCanvas: true, config: { avoidInlineStyle: false, forceClass: false } });
  });

  afterEach(() => {
    dragger?.stop(new MouseEvent('mouseup'));
    toolbar?.remove();
    jest.restoreAllMocks();
    testEditor.editor.destroy();
  });

  const setup = ({ zoom = 1.5, frameLeft = 50, frameTop = 80, toolbarX = 390, toolbarY = 180 } = {}) => {
    const { editor, em, cmpRoot } = testEditor;
    editor.setDragMode('absolute');
    editor.Canvas.setZoom(zoom * 100);
    const parent = cmpRoot.append({ style: { position: 'relative', width: '500px', height: '350px' } })[0];
    const component = parent.append({
      style: {
        position: 'absolute',
        left: '100px',
        top: '100px',
        width: '120px',
        height: '60px',
      },
    })[0];
    editor.Canvas.getBody().appendChild(cmpRoot.getEl()!);
    const frame = editor.Canvas.getFrameEl();
    jest.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      left: frameLeft,
      top: frameTop,
      x: frameLeft,
      y: frameTop,
      width: 900 * zoom,
      height: 600 * zoom,
      right: frameLeft + 900 * zoom,
      bottom: frameTop + 600 * zoom,
      toJSON: () => ({}),
    });
    editor.Commands.add('test:toolbar-drag', ComponentDrag);
    command = editor.Commands.get('test:toolbar-drag') as ComponentDrag;
    // Guide snapping is separate from converting a toolbar pointer into frame coordinates.
    jest.spyOn(command, 'getGuidesStatic').mockReturnValue([]);
    jest.spyOn(command, 'getGuidesTarget').mockReturnValue([]);
    const start = (event: Event) => {
      dragger = editor.runCommand('test:toolbar-drag', { target: component, event, skipGuidesRender: true }) as Dragger;
    };
    toolbar = new ToolbarButtonView({
      config: { em },
      model: new ToolbarButton({
        command: (_editor, _sender, options) => start(options.event),
      }),
    });
    const startScreenX = frameLeft + toolbarX * zoom;
    const startScreenY = frameTop + toolbarY * zoom;
    const pointer = (clientX: number, clientY: number) => {
      const ev = new MouseEvent('mousemove', { clientX, clientY, bubbles: true, buttons: 1 });
      Object.defineProperty(ev, 'which', { value: 1 });
      return ev;
    };
    const toolbarStart = () =>
      toolbar.handleClick(
        new MouseEvent('mousedown', {
          clientX: startScreenX,
          clientY: startScreenY,
          buttons: 1,
        }),
      );
    const directStart = () => start(pointer(toolbarX, toolbarY));
    const move = (screenDx = 30, screenDy = 0) => {
      // Native mouse events from the iframe report unscaled frame CSS pixels.
      component.getEl()!.dispatchEvent(pointer(toolbarX + screenDx / zoom, toolbarY + screenDy / zoom));
      return component.getStyle();
    };
    return { component, toolbarStart, directStart, move };
  };

  test.each([
    [1, '130px'],
    [1.5, '120px'],
    [0.5, '160px'],
    [2, '115px'],
  ] as const)('toolbar drag follows a 30-screen-pixel movement at zoom %s', (zoom, left) => {
    const { toolbarStart, move } = setup({ zoom });
    toolbarStart();
    const style = move();
    expect(style).toMatchObject({ left, top: '100px' });
  });

  test.each([0.5, 1, 1.5, 2])('direct drag remains correct at zoom %s', (zoom) => {
    const { directStart, move } = setup({ zoom });
    directStart();
    expect(move()).toMatchObject({ left: `${100 + 30 / zoom}px`, top: '100px' });
  });

  test('toolbar drag has no jump on the first iframe event without pointer movement', () => {
    const { toolbarStart, move } = setup();
    toolbarStart();
    expect(move(0)).toMatchObject({ left: '100px', top: '100px' });
  });

  test('toolbar drag converts vertical movement too', () => {
    const { toolbarStart, move } = setup();
    toolbarStart();
    expect(move(0, 30)).toMatchObject({ left: '100px', top: '120px' });
  });

  test('frame placement does not affect toolbar drag distance', () => {
    const { toolbarStart, move } = setup({ frameLeft: 250, frameTop: 150 });
    toolbarStart();
    expect(move()).toMatchObject({ left: '120px', top: '100px' });
  });
});
