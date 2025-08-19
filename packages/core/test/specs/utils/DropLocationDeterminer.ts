// @ts-nocheck
import { DropLocationDeterminer } from '../../../src/utils/sorter/DropLocationDeterminer';
import { SortableTreeNode } from '../../../src/utils/sorter/SortableTreeNode';
import { DragDirection } from '../../../src/utils/sorter/types';

class DummyNode extends SortableTreeNode<any> {
  getChildren() {
    return [];
  }
  getParent() {
    return null;
  }
  addChildAt(node: any) {
    return node;
  }
  removeChildAt() {}
  indexOfChild() {
    return 0;
  }
  canMove() {
    return true;
  }
  get view() {
    return undefined;
  }
  get element() {
    return undefined;
  }
}

describe('DropLocationDeterminer', () => {
  test('resetLastMoveData clears all move data', () => {
    const container = document.createElement('div');
    const determiner = new DropLocationDeterminer({
      em: {} as any,
      treeClass: DummyNode,
      containerContext: { container, itemSel: '', document },
      positionOptions: {},
      dragDirection: DragDirection.BothDirections,
      eventHandlers: {},
    });

    determiner.lastMoveData = {
      targetNode: {} as any,
      hoveredNode: {} as any,
      index: 1,
      hoveredIndex: 2,
      placement: 'before',
      mouseEvent: new MouseEvent('mousemove'),
      placeholderDimensions: {} as any,
    };

    // @ts-ignore - accessing private method for test
    determiner.resetLastMoveData();

    expect(determiner.lastMoveData).toEqual({
      targetNode: undefined,
      hoveredNode: undefined,
      index: undefined,
      hoveredIndex: undefined,
      placement: undefined,
      mouseEvent: undefined,
      placeholderDimensions: undefined,
    });
  });
});

