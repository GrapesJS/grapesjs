import { DropLocationDeterminer } from '../../../../src/utils/sorter/DropLocationDeterminer';
import { SortableTreeNode } from '../../../../src/utils/sorter/SortableTreeNode';
import Dimension from '../../../../src/utils/sorter/Dimension';
import { DragDirection, DragSource } from '../../../../src/utils/sorter/types';
import { setupTestEditor } from '../../../common';
import Editor from '../../../../src/editor';

// Minimal concrete SortableTreeNode for test use only.
// The treeClass constructor signature requires (model, dragSource?); we stash
// the element and children on the instance after construction via factory helpers.
class TestNode extends SortableTreeNode<any> {
  public _element: HTMLElement | undefined;
  public _children: TestNode[] = [];
  public _parent: TestNode | null = null;

  constructor(model: any = {}, dragSource: DragSource<any> = {}) {
    super(model, dragSource);
  }

  static create(element?: HTMLElement, children: TestNode[] = []): TestNode {
    const node = new TestNode();
    node._element = element;
    node._children = children;
    node._children.forEach((c) => (c._parent = node));
    return node;
  }

  get element() {
    return this._element;
  }
  get view() {
    return undefined;
  }
  getChildren() {
    return this._children.length ? this._children : null;
  }
  getParent() {
    return this._parent;
  }
  addChildAt(node: TestNode, index: number) {
    return node;
  }
  removeChildAt(_index: number) {}
  indexOfChild(node: TestNode) {
    return this._children.indexOf(node);
  }
  canMove() {
    return true;
  }
  equals(other?: TestNode): other is TestNode {
    return other === this;
  }
}

function makeDeterminer(em: any, itemSel = '.gjs-comp') {
  const container = document.createElement('div');
  return new DropLocationDeterminer<any, TestNode>({
    em,
    treeClass: TestNode,
    containerContext: {
      container,
      itemSel,
      document,
    },
    positionOptions: { canvasRelative: false, relative: false, windowMargin: 0 },
    dragDirection: DragDirection.Vertical,
    eventHandlers: {},
  });
}

function makeDim(top: number, height: number, indexEl?: number): Dimension {
  const d = new Dimension({ top, left: 0, height, width: 200, offsets: {} as any, dir: true });
  d.indexEl = indexEl;
  return d;
}

describe('Sorter drop-index offset (comment-node skew)', () => {
  let editor: Editor;
  let fixtures: HTMLElement;

  beforeEach(() => {
    ({ editor, fixtures } = setupTestEditor({ withCanvas: true }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    editor.destroy();
  });

  describe('Dimension', () => {
    test('clone preserves indexEl', () => {
      const d = makeDim(0, 100, 3);
      const cloned = d.clone();
      expect(cloned.indexEl).toBe(3);
    });

    test('clone without indexEl keeps it undefined', () => {
      const d = makeDim(0, 100);
      expect(d.clone().indexEl).toBeUndefined();
    });
  });

  describe('getChildrenDim', () => {
    test('stamps indexEl with unfiltered child position, skipping null-element children', () => {
      const determiner = makeDeterminer(editor.getModel());
      const parentEl = document.createElement('div');

      // Children: [no-el, div, no-el, div, div] — indices 0,1,2,3,4 in model
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      div1.className = 'gjs-comp';
      div2.className = 'gjs-comp';
      div3.className = 'gjs-comp';

      const parent = TestNode.create(parentEl, [
        TestNode.create(undefined),
        TestNode.create(div1),
        TestNode.create(undefined),
        TestNode.create(div2),
        TestNode.create(div3),
      ]);

      jest
        .spyOn(determiner as any, 'getDim')
        .mockImplementation((el: unknown) => makeDim(el === div1 ? 0 : el === div2 ? 100 : 200, 100));
      jest.spyOn(determiner as any, 'getDirection').mockReturnValue(true);

      const dims: Dimension[] = (determiner as any).getChildrenDim(parent);

      expect(dims).toHaveLength(3);
      expect(dims[0].indexEl).toBe(1);
      expect(dims[1].indexEl).toBe(3);
      expect(dims[2].indexEl).toBe(4);
    });
  });

  describe('getDropPosition', () => {
    test('returns model-space index when earlier children are filtered out', () => {
      // Scenario: parent [skip, div, skip, div, div]
      // Mouse after the last div → should land at model index 5 (after index 4)
      const determiner = makeDeterminer(editor.getModel());
      const parentEl = document.createElement('div');

      const parent = TestNode.create(parentEl, [
        TestNode.create(undefined),
        TestNode.create(document.createElement('div')),
        TestNode.create(undefined),
        TestNode.create(document.createElement('div')),
        TestNode.create(document.createElement('div')),
      ]);

      const parentDim = makeDim(0, 300);
      parent.nodeDimensions = parentDim;
      // Pre-supply childrenDimensions with correct indexEl so getChildrenDim is bypassed
      parent.childrenDimensions = [makeDim(0, 100, 1), makeDim(100, 100, 3), makeDim(200, 100, 4)];

      // y=280 is inside the last child (top=200, height=100) and past its center
      const result = (determiner as any).getDropPosition(parent, 100, 280);

      expect(result.placement).toBe('after');
      // Without fix: index would be 2+1=3; with fix: (4 ?? 2)+1=5
      expect(result.index).toBe(5);
    });

    test('returns correct index when drop is before a middle child', () => {
      const determiner = makeDeterminer(editor.getModel());
      const parentEl = document.createElement('div');

      const parent = TestNode.create(parentEl, [
        TestNode.create(undefined),
        TestNode.create(document.createElement('div')),
        TestNode.create(undefined),
        TestNode.create(document.createElement('div')),
        TestNode.create(document.createElement('div')),
      ]);

      parent.nodeDimensions = makeDim(0, 300);
      // Pre-supply childrenDimensions: skip items 0 and 2
      parent.childrenDimensions = [makeDim(0, 100, 1), makeDim(100, 100, 3), makeDim(200, 100, 4)];

      // y=40 is in first child (top=0, height=100) before its center (50)
      const result = (determiner as any).getDropPosition(parent, 100, 40);

      expect(result.placement).toBe('before');
      // dimensionIndex=0, indexEl=1, placement='before' → index = 1+0 = 1
      expect(result.index).toBe(1);
    });

    test('does not crash when all children lack measurable elements', () => {
      // Second bug: parent with only un-measurable children → childrenDimensions=[]
      const determiner = makeDeterminer(editor.getModel());
      const parentEl = document.createElement('div');

      const parent = TestNode.create(parentEl, [TestNode.create(undefined), TestNode.create(undefined)]);

      parent.nodeDimensions = makeDim(0, 200);
      parent.childrenDimensions = []; // all filtered out

      // Should not throw and should return index=0, placement='inside'
      let result: any;
      expect(() => {
        result = (determiner as any).getDropPosition(parent, 100, 100);
      }).not.toThrow();

      expect(result.index).toBe(0);
      expect(result.placement).toBe('inside');
    });

    test('clean children (no skipped nodes) are unaffected', () => {
      // Regression: if no children are filtered, indexEl == dimensionIndex and result is identical
      const determiner = makeDeterminer(editor.getModel());
      const parentEl = document.createElement('div');

      const parent = TestNode.create(parentEl, [
        TestNode.create(document.createElement('div')),
        TestNode.create(document.createElement('div')),
        TestNode.create(document.createElement('div')),
      ]);

      parent.nodeDimensions = makeDim(0, 300);
      parent.childrenDimensions = [makeDim(0, 100, 0), makeDim(100, 100, 1), makeDim(200, 100, 2)];

      // y=280 → after last child (index 2) → 2+1=3
      const result = (determiner as any).getDropPosition(parent, 100, 280);
      expect(result.placement).toBe('after');
      expect(result.index).toBe(3);
    });
  });
});
