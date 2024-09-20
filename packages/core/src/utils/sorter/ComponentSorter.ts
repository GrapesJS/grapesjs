import { CanvasSpotBuiltInTypes } from "../../canvas/model/CanvasSpot";
import Component from "../../dom_components/model/Component";
import EditorModel from "../../editor/model/Editor";
import { getPointerEvent } from "../dom";
import { BaseComponentNode } from "./BaseComponentNode";
import Sorter from "./Sorter";
import { SorterContainerContext, PositionOptions, SorterDragBehaviorOptions, SorterEventHandlers } from './types';

export default class ComponentSorter extends Sorter<Component, BaseComponentNode> {
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
        treeClass: new (model: Component) => BaseComponentNode,
        containerContext: SorterContainerContext;
        dragBehavior: SorterDragBehaviorOptions;
        positionOptions?: PositionOptions;
        eventHandlers?: SorterEventHandlers<BaseComponentNode>;
    }) {
        super({
            em,
            treeClass,
            containerContext,
            positionOptions,
            dragBehavior,
            eventHandlers: {
                ...eventHandlers,
                onStartSort: (sourceNodes: BaseComponentNode[], containerElement?: HTMLElement) => {
                    eventHandlers.onStartSort?.(sourceNodes, containerElement);
                    this.onStartSort();
                },
                onDrop: (targetNode: BaseComponentNode | undefined, sourceNodes: BaseComponentNode[], index: number) => {
                    eventHandlers.onDrop?.(targetNode, sourceNodes, index);
                    this.onDrop(targetNode, sourceNodes, index);
                },
                onTargetChange: (oldTargetNode: BaseComponentNode | undefined, newTargetNode: BaseComponentNode | undefined) => {
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

    onStartSort() {
        this.em.clearSelection();
        this.toggleSortCursor(true);
        const model = this.sourceNodes?.[0].model;
        this.eventHandlers.legacyOnStartSort?.({
            sorter: this,
            target: model,
            // @ts-ignore
            parent: model && model.parent?.(),
            // @ts-ignore
            index: model && model.index?.(),
        });
    }

    onMouseMove = (mouseEvent: MouseEvent) => {
        const insertingTextableIntoText = this.targetIsText && this.sourceNodes?.some(node => node.model?.get?.('textable'))
        if (insertingTextableIntoText) {
            this.updateTextViewCursorPosition(mouseEvent);
        }
    }

    onDrop = (targetNode: BaseComponentNode | undefined, sourceNodes: BaseComponentNode[], index: number) => {
        if (!targetNode) return
        const legacyOnEndMove = this.eventHandlers.legacyOnEndMove;
        const model = this.sourceNodes?.[0].model;
        const data = {
            target: model,
            // @ts-ignore
            parent: model && model.parent(),
            // @ts-ignore
            index: model && model.index(),
        };

        for (let idx = 0; idx < sourceNodes.length; idx++) {
            const sourceNode = sourceNodes[idx];
            const addedNode = this.addSourceNodeToTarget(sourceNode, targetNode, index);
            if (!addedNode) continue
            legacyOnEndMove?.(addedNode!.model, this, data)
        }
        if (sourceNodes.length === 0) {
            legacyOnEndMove?.(null, this, { ...data, cancelled: 1 });
        }


        this.placeholder.hide();
    }

    private addSourceNodeToTarget(sourceNode: BaseComponentNode, targetNode: BaseComponentNode, index: number) {
        sourceNode.clearState();
        if (!targetNode.canMove(sourceNode, index)) {
            return;
        }
        const parent = sourceNode.getParent();
        let initialSourceIndex = -1;
        if (parent) {
            initialSourceIndex = parent.indexOfChild(sourceNode);
            parent.removeChildAt(initialSourceIndex);
        }
        const isSameCollection = parent?.model.cid === targetNode.model.cid;
        if (isSameCollection && initialSourceIndex < index) {
            index--;
        }

        const addedNode = targetNode.addChildAt(sourceNode, index);
        targetNode.clearState();
        return addedNode;
    }

    private onTargetChange = (oldTargetNode: BaseComponentNode | undefined, newTargetNode: BaseComponentNode | undefined) => {
        oldTargetNode?.clearState();

        if (!newTargetNode) {
            return
        }
        newTargetNode?.setSelectedParentState();
        this.targetIsText = newTargetNode.isTextNode();
        const insertingTextableIntoText = this.targetIsText && this.sourceNodes?.some(node => node.isTextable())
        if (insertingTextableIntoText) {
            const el = newTargetNode?.model.getEl();
            if (el) el.contentEditable = "true";

            this.placeholder.hide();
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
}