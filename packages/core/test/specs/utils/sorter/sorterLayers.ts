import Component from '../../../../src/dom_components/model/Component';
import Editor from '../../../../src/editor';
import Dimension from '../../../../src/utils/sorter/Dimension';
import LayersComponentNode from '../../../../src/utils/sorter/LayersComponentNode';
import { setupTestEditor } from '../../../common';

describe('Layers sorter', () => {
  let editor: Editor;
  let fixtures: HTMLElement;

  const setCanvasVisibility = (cmp: Component, visible: boolean) => {
    const el = cmp.getEl();

    Object.defineProperty(el, 'offsetWidth', {
      configurable: true,
      get: () => (visible ? 120 : 0),
    });

    Object.defineProperty(el, 'offsetHeight', {
      configurable: true,
      get: () => (visible ? 24 : 0),
    });
  };

  const getChildIds = (cmp: Component) => cmp.components().map((child) => child.getAttributes().id);

  beforeEach(() => {
    ({ editor, fixtures } = setupTestEditor({ withCanvas: true }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    editor.destroy();
  });

  test('moves the hidden source after the target without removing other hidden siblings', () => {
    editor.setComponents(`
      <div id="hidden-a" style="display: none;"></div>
      <div id="visible-a">Visible A</div>
      <div id="visible-b">Visible B</div>
      <div id="hidden-b" style="display: none;"></div>
    `);

    const wrapper = editor.getWrapper()!;
    const source = wrapper.find('#hidden-a')[0];
    const target = wrapper.find('#visible-a')[0];
    const visibleSibling = wrapper.find('#visible-b')[0];
    const trailingHidden = wrapper.find('#hidden-b')[0];

    editor.select(source);
    editor.Layers.setRoot(wrapper);

    fixtures.appendChild(editor.Layers.render());

    const sorter = source.viewLayer!.sorter;
    const sourceLayer = source.viewLayer!.el;

    setCanvasVisibility(source, false);
    setCanvasVisibility(target, true);
    setCanvasVisibility(visibleSibling, true);
    setCanvasVisibility(trailingHidden, false);

    sorter.startSort([{ element: sourceLayer }]);
    sorter.dropLocationDeterminer.lastMoveData = {
      targetNode: new LayersComponentNode(wrapper),
      index: 2,
    };

    sorter.endDrag();

    expect(getChildIds(wrapper)).toEqual(['visible-a', 'hidden-a', 'visible-b', 'hidden-b']);
  });

  test('escalates the drop target to the parent when a slow drag leaves the drop bounds without changing node or index', () => {
    editor.setComponents(`
      <div id="block-a">Block A</div>
      <div id="block-b">Block B</div>
      <div id="section-c"><div id="child-c1">Child C1</div></div>
    `);

    const wrapper = editor.getWrapper()!;
    const source = wrapper.find('#block-a')[0];
    const blockB = wrapper.find('#block-b')[0];
    const sectionC = wrapper.find('#section-c')[0];

    editor.select(source);
    editor.Layers.setRoot(wrapper);
    fixtures.appendChild(editor.Layers.render());

    const sorter = source.viewLayer!.sorter;
    const determiner: any = sorter.dropLocationDeterminer;
    const sectionEl = sectionC.viewLayer!.el;

    // Container-relative boxes for a vertical layer list. The section's drop
    // area (ratio 0.4, min 3px, max 20px) shrinks 76-124 to 90.4-109.6.
    const box = (top: number, height: number) =>
      new Dimension({ top, left: 0, height, width: 200, offsets: {} as any, dir: true });
    const boxes = new Map<HTMLElement | undefined, Dimension>([
      [source.viewLayer!.el, box(28, 24)],
      [blockB.viewLayer!.el, box(52, 24)],
      [sectionEl, box(76, 48)],
    ]);
    const wrapperBox = () => box(0, 300);

    // The container offset makes viewport and container coordinates diverge,
    // as they do in a real page where the layer panel is not at the origin.
    const offsetTop = 200;
    jest.spyOn(determiner, 'cacheContainerPosition').mockImplementation(() => {
      determiner.containerOffset = { top: offsetTop, left: 0 };
    });
    jest.spyOn(determiner, 'getDim').mockImplementation((el: any) => boxes.get(el)?.clone() ?? wrapperBox());
    jest.spyOn(determiner, 'getDirection').mockReturnValue(true);
    jest.spyOn(determiner, 'getMouseTargetElement').mockReturnValue(sectionEl);
    jest.spyOn(determiner, 'getFirstElementWithAModel').mockReturnValue(sectionEl);
    // Placeholder placement is downstream of target selection and needs
    // rendered child layers, which jsdom cannot lay out.
    jest.spyOn(determiner, 'getDropPosition').mockImplementation(() => ({
      index: 0,
      placement: 'before',
      placeholderDimensions: box(0, 0),
    }));

    sorter.startSort([{ element: source.viewLayer!.el }]);
    const move = (containerY: number) =>
      determiner.handleMove(new MouseEvent('mousemove', { clientX: 100, clientY: containerY + offsetTop }));

    // Inside the section's drop area: the section itself is the target.
    move(95);
    expect(determiner.lastMoveData.targetNode?.model).toBe(sectionC);

    // Slow drag into the edge band above the drop area: same hovered node,
    // same index ('before' in both samples), but the target must escalate
    // to the wrapper instead of sticking to the cached section.
    move(85);
    expect(determiner.lastMoveData.targetNode?.model).toBe(wrapper);

    determiner.cancelDrag();
  });
});
