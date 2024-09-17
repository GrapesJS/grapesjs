import { CanvasSpotBuiltInTypes } from "../../canvas/model/CanvasSpot";
import Component from "../../dom_components/model/Component";
import EditorModel from "../../editor/model/Editor";
import { BaseComponentNode } from "./BaseComponentNode";
import Sorter from "./Sorter";
import { SorterContainerContext, PositionOptions, SorterDragBehaviorOptions, SorterEventHandlers } from './types';

const targetSpotType = CanvasSpotBuiltInTypes.Target;
const spotTarget = {
    id: 'sorter-target',
    type: targetSpotType,
};

export default class ComponentSorter extends Sorter<Component> {
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
            // @ts-ignore
            em,
            treeClass,
            containerContext,
            positionOptions,
            dragBehavior,
            eventHandlers: {
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
                ...eventHandlers,
            },
        });
        
        this.treeClass = treeClass;
    }

    getNodeFromModel(model: Component): BaseComponentNode {
        return new this.treeClass(model);
    }

    onComponentStartSort = (sourceNode: BaseComponentNode) => {
        this.em.clearSelection();
        this.toggleSortCursor(true);
        this.em.trigger('sorter:drag:start', sourceNode?.element, sourceNode?.model);
    }

    onComponentDrop = (targetNode: BaseComponentNode, sourceNode: BaseComponentNode, index: number) => {
        sourceNode.model.set('status', '');
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