import EditorModel from '../../editor/model/Editor';
import Layer from '../../style_manager/model/Layer';
import Layers from '../../style_manager/model/Layers';
import { LayerNode } from './LayerNode';
import Sorter from './Sorter';
import { SorterContainerContext, PositionOptions, SorterDragBehaviorOptions, SorterEventHandlers } from './types';

export default class StyleManagerSorter extends Sorter<Layers | Layer, LayerNode> {
  constructor({
    em,
    containerContext,
    dragBehavior,
    positionOptions = {},
    eventHandlers = {},
  }: {
    em: EditorModel;
    containerContext: SorterContainerContext;
    dragBehavior: SorterDragBehaviorOptions;
    positionOptions?: PositionOptions;
    eventHandlers?: SorterEventHandlers<LayerNode>;
  }) {
    super({
      em,
      treeClass: LayerNode,
      containerContext,
      positionOptions,
      dragBehavior,
      eventHandlers: {
        onStartSort: (sourceNodes: LayerNode[], containerElement?: HTMLElement) => {
          eventHandlers.onStartSort?.(sourceNodes, containerElement);
          this.onLayerStartSort(sourceNodes);
        },
        onDrop: (targetNode: LayerNode | undefined, sourceNodes: LayerNode[], index: number | undefined) => {
          eventHandlers.onDrop?.(targetNode, sourceNodes, index);
          this.onLayerDrop(targetNode, sourceNodes, index);
        },
        onEnd: () => {
          this.placeholder.hide();
        },
        ...eventHandlers,
      },
    });
  }

  onLayerStartSort = (sourceNodes: LayerNode[]) => {
    this.em.clearSelection();

    // For backward compatibility, leave it to a single node
    const sourceNode = sourceNodes[0];
    this.em.trigger('sorter:drag:start', sourceNode?.element, sourceNode?.model);
    this.placeholder.show();
  };

  onLayerDrop = (targetNode: LayerNode | undefined, sourceNodes: LayerNode[], index: number | undefined) => {
    if (!targetNode) {
      return;
    }
    index = typeof index === 'number' ? index : -1;
    for (let idx = 0; idx < sourceNodes.length; idx++) {
      const sourceNode = sourceNodes[idx];
      if (!targetNode.canMove(sourceNode, idx)) {
        continue;
      }
      const parent = sourceNode.getParent();
      let initialSourceIndex = -1;
      if (parent) {
        initialSourceIndex = parent.indexOfChild(sourceNode);
        parent.removeChildAt(initialSourceIndex);
      }
      index = initialSourceIndex < index ? index - 1 : index;

      targetNode.addChildAt(sourceNode, index);
    }
    this.placeholder.hide();
  };
}
