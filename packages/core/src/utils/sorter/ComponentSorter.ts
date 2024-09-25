import { CanvasSpotBuiltInTypes } from '../../canvas/model/CanvasSpot';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import { getPointerEvent } from '../dom';
import { BaseComponentNode } from './BaseComponentNode';
import Sorter from './Sorter';
import { SorterContainerContext, PositionOptions, SorterDragBehaviorOptions, SorterEventHandlers } from './types';

const targetSpotType = CanvasSpotBuiltInTypes.Target;

const spotTarget = {
  id: 'sorter-target',
  type: targetSpotType,
};

export default class ComponentSorter<NodeType extends BaseComponentNode> extends Sorter<Component, NodeType> {
  targetIsText: boolean = false;
  constructor({
    em,
    treeClass,
    containerContext,
    dragBehavior,
    positionOptions = {},
    eventHandlers = {},
  }: {
    em: EditorModel;
    treeClass: new (model: Component) => NodeType;
    containerContext: SorterContainerContext;
    dragBehavior: SorterDragBehaviorOptions;
    positionOptions?: PositionOptions;
    eventHandlers?: SorterEventHandlers<NodeType>;
  }) {
    super({
      em,
      treeClass,
      containerContext,
      positionOptions,
      dragBehavior,
      eventHandlers: {
        ...eventHandlers,
        onStartSort: (sourceNodes: NodeType[], containerElement?: HTMLElement) => {
          eventHandlers.onStartSort?.(sourceNodes, containerElement);
          this.onStartSort();
        },
        onDrop: (targetNode: NodeType | undefined, sourceNodes: NodeType[], index: number | undefined) => {
          eventHandlers.onDrop?.(targetNode, sourceNodes, index);
          this.onDrop(targetNode, sourceNodes, index);
        },
        onTargetChange: (oldTargetNode: NodeType | undefined, newTargetNode: NodeType | undefined) => {
          eventHandlers.onTargetChange?.(oldTargetNode, newTargetNode);
          this.onTargetChange(oldTargetNode, newTargetNode);
        },
        onMouseMove: (mouseEvent) => {
          eventHandlers.onMouseMove?.(mouseEvent);
          this.onMouseMove(mouseEvent);
        },
      },
    });
  }

  private onStartSort() {
    this.em.clearSelection();
    this.toggleSortCursor(true);
  }

  private onMouseMove = (mouseEvent: MouseEvent) => {
    const insertingTextableIntoText = this.targetIsText && this.sourceNodes?.some((node) => node.isTextable());
    if (insertingTextableIntoText) {
      this.updateTextViewCursorPosition(mouseEvent);
    }
  };

  private onDrop = (targetNode: NodeType | undefined, sourceNodes: NodeType[], index: number | undefined) => {
    if (!targetNode) return;
    index = typeof index === 'number' ? index : -1;
    const model = this.sourceNodes?.[0].model;
    const data = {
      target: model,
      // @ts-ignore
      parent: model && model.parent(),
      // @ts-ignore
      index: model && model.index(),
    };
    if (sourceNodes.length === 0) {
      this.eventHandlers.legacyOnEndMove?.(null, this, { ...data });
    }

    for (let idx = 0; idx < sourceNodes.length; idx++) {
      const sourceNode = sourceNodes[idx];
      if (!targetNode.canMove(sourceNode, index)) continue;
      const addedNode = this.addSourceNodeToTarget(sourceNode, targetNode, index);
      this.eventHandlers.legacyOnEndMove?.(addedNode!.model, this, data);
    }
    targetNode.restNodeState();
    this.placeholder.hide();
  };

  private addSourceNodeToTarget(sourceNode: NodeType, targetNode: NodeType, index: number) {
    const parent = sourceNode.getParent();
    let initialSourceIndex = -1;
    if (parent) {
      initialSourceIndex = parent.indexOfChild(sourceNode);
      parent.removeChildAt(initialSourceIndex, { temporary: true });
    }
    const isSameCollection = parent?.model.cid === targetNode.model.cid;
    if (isSameCollection && initialSourceIndex < index) {
      index--;
    }

    const addedNode = targetNode.addChildAt(sourceNode, index, { action: 'move-component' });
    return addedNode;
  }

  /**
   * Finalize the move by removing any helpers and selecting the target model.
   *
   * @private
   */
  protected finalizeMove(): void {
    this.em?.Canvas.removeSpots(spotTarget);
    this.sourceNodes?.forEach((node) => node.restNodeState());
    super.finalizeMove();
  }

  private onTargetChange = (oldTargetNode: NodeType | undefined, newTargetNode: NodeType | undefined) => {
    oldTargetNode?.restNodeState();
    if (!newTargetNode) {
      return;
    }
    newTargetNode?.setSelectedParentState();
    this.targetIsText = newTargetNode.isTextNode();
    const insertingTextableIntoText = this.targetIsText && this.sourceNodes?.some((node) => node.isTextable());
    if (insertingTextableIntoText) {
      newTargetNode.setContentEditable(true);
      this.placeholder.hide();
    } else {
      this.placeholder.show();
    }
  };

  private updateTextViewCursorPosition(e: any) {
    const { em } = this;
    if (!em) return;
    const Canvas = em.Canvas;
    const targetDoc = Canvas.getDocument();
    let range = null;

    const poiner = getPointerEvent(e);

    // @ts-ignore
    if (targetDoc.caretPositionFromPoint) {
      // New standard method
      // @ts-ignore
      const caretPosition = targetDoc.caretPositionFromPoint(poiner.clientX, poiner.clientY);
      if (caretPosition) {
        range = targetDoc.createRange();
        range.setStart(caretPosition.offsetNode, caretPosition.offset);
      }
    } else if (targetDoc.caretRangeFromPoint) {
      // Fallback for older browsers
      range = targetDoc.caretRangeFromPoint(poiner.clientX, poiner.clientY);
    } else if (e.rangeParent) {
      // Firefox fallback
      range = targetDoc.createRange();
      range.setStart(e.rangeParent, e.rangeOffset);
    }

    const sel = Canvas.getWindow().getSelection();
    Canvas.getFrameEl().focus();
    sel?.removeAllRanges();
    range && sel?.addRange(range);
  }

  /**
   * Toggle cursor while sorting
   * @param {Boolean} active
   */
  private toggleSortCursor(active?: boolean) {
    const { em } = this;
    const cv = em?.Canvas;

    // Avoid updating body className as it causes a huge repaint
    // Noticeable with "fast" drag of blocks
    cv && (active ? cv.startAutoscroll() : cv.stopAutoscroll());
  }
}
