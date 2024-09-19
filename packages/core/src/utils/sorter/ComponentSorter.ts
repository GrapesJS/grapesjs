import { CanvasSpotBuiltInTypes } from "../../canvas/model/CanvasSpot";
import Component from "../../dom_components/model/Component";
import EditorModel from "../../editor/model/Editor";
import { getPointerEvent } from "../dom";
import { BaseComponentNode } from "./BaseComponentNode";
import Sorter from "./Sorter";
import { SorterContainerContext, PositionOptions, SorterDragBehaviorOptions, SorterEventHandlers } from './types';

const targetSpotType = CanvasSpotBuiltInTypes.Target;
const spotTarget = {
    id: 'sorter-target',
    type: targetSpotType,
};

export default class ComponentSorter extends Sorter<Component> {
    treeClass: new (model: Component) => BaseComponentNode;
    targetIsText: boolean = false;
    constructor({
        em,
        treeClass,
        containerContext,
        positionOptions,
        dragBehavior,
        eventHandlers = {},
    }: {
        em: EditorModel;
        treeClass: new (model: Component) => BaseComponentNode,
        containerContext: SorterContainerContext;
        positionOptions: PositionOptions;
        dragBehavior: SorterDragBehaviorOptions;
        eventHandlers?: SorterEventHandlers<Component>;
    }) {
        super({
            em,
            treeClass,
            containerContext,
            positionOptions,
            dragBehavior,
            eventHandlers: {
                ...eventHandlers,
                onStartSort: (sourceNode: BaseComponentNode, containerElement?: HTMLElement) => {
                    eventHandlers.onStartSort?.(sourceNode, containerElement);
                    this.onComponentStartSort(sourceNode);
                },
                onDrop: (targetNode: BaseComponentNode, sourceNode: BaseComponentNode, index: number) => {
                    eventHandlers.onDrop?.(targetNode, sourceNode, index);
                    this.onComponentDrop(targetNode, sourceNode, index);
                },
                onTargetChange: (oldTargetNode: BaseComponentNode, newTargetNode: BaseComponentNode) => {
                    eventHandlers.onTargetChange?.(oldTargetNode, newTargetNode);
                    this.onTargetChange(oldTargetNode, newTargetNode);
                },
                onMouseMove: (mouseEvent) => {
                    eventHandlers.onMouseMove?.(mouseEvent);
                    this.onMouseMove(mouseEvent);
                },
            },
        });

        this.treeClass = treeClass;
    }

    onComponentStartSort(sourceNode: BaseComponentNode) {
        this.em.clearSelection();
        this.toggleSortCursor(true);
        this.em.trigger('sorter:drag:start', sourceNode?.element, sourceNode?.model);
    }

    onMouseMove = (mouseEvent: MouseEvent) => {
        const insertingTextableIntoText = this.targetIsText && this.sourceNode?.model?.get?.('textable');
        if (insertingTextableIntoText) {
            this.updateTextViewCursorPosition(mouseEvent);
        }
    }

    onComponentDrop = (targetNode: BaseComponentNode, sourceNode: BaseComponentNode, index: number) => {
        sourceNode.model?.set?.('status', '');
        if (targetNode) {
            const parent = sourceNode.getParent();
            let initialSourceIndex = -1;
            if (parent) {
                initialSourceIndex = parent.indexOfChild(sourceNode);
                parent.removeChildAt(initialSourceIndex)
            }
            const isSameCollection = parent?.model.cid === targetNode.model.cid
            if (isSameCollection && initialSourceIndex < index) {
                index--;
            }

            targetNode.addChildAt(sourceNode, index);
        }
        targetNode?.model?.set('status', '');

        this.placeholder.hide();
    }

    onTargetChange = (oldTargetNode: BaseComponentNode, newTargetNode: BaseComponentNode) => {
        oldTargetNode?.model?.set('status', '');
        newTargetNode?.model?.set('status', 'selected-parent');
        this.targetIsText = newTargetNode.model?.isInstanceOf?.('text');
        const insertingTextableIntoText = this.targetIsText && this.sourceNode?.model?.get?.('textable');
        if (insertingTextableIntoText) {
            const el = newTargetNode?.model.getEl();
            if (el) el.contentEditable = "true";

            this.placeholder.hide()
        } else {
            this.placeholder.show();
        }
    }

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

    get scale() {
        return () => this.em!.getZoomDecimal()
    }

    setSelection(node: BaseComponentNode, selected: Boolean) {
        const model = node.model;
        const cv = this.em!.Canvas;
        const { Select, Hover, Spacing } = CanvasSpotBuiltInTypes;
        [Select, Hover, Spacing].forEach((type) => cv.removeSpots({ type }));
        cv.addSpot({ ...spotTarget, component: model as any });
        model.set('status', selected ? 'selected-parent' : '');
    }
}