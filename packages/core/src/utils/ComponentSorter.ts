import { isFunction } from "underscore";
import { CanvasSpotBuiltInTypes } from "../canvas/model/CanvasSpot";
import Component from "../dom_components/model/Component";
import EditorModel from "../editor/model/Editor";
import { ComponentNode } from "./ComponentNode";
import Sorter, { SorterContainerContext, PositionOptions, SorterDragBehaviorOptions, SorterEventHandlers } from "./Sorter";

const targetSpotType = CanvasSpotBuiltInTypes.Target;
const spotTarget = {
    id: 'sorter-target',
    type: targetSpotType,
};

export default class ComponentSorter extends Sorter<Component> {
    constructor({
        em,
        containerContext,
        positionOptions,
        dragBehavior,
        eventHandlers = {},
    }: {
        em: EditorModel;
        containerContext: SorterContainerContext;
        positionOptions: PositionOptions;
        dragBehavior: SorterDragBehaviorOptions;
        eventHandlers?: SorterEventHandlers<Component>;
    }) {
        super({
            // @ts-ignore
            em,
            containerContext,
            positionOptions,
            dragBehavior,
            eventHandlers: {
                onStartSort: (sourceNode: ComponentNode, containerElement?: HTMLElement) => {
                    eventHandlers.onStartSort?.(sourceNode, containerElement);
                    this.onComponentStartSort(sourceNode);
                },
                onDrop: (targetNode: ComponentNode, sourceNode: ComponentNode, index: number) => {
                    eventHandlers.onDrop?.(targetNode, sourceNode, index);
                    this.onComponentDrop(targetNode, sourceNode, index);
                },
                onTargetChange: (oldTargetNode: ComponentNode, newTargetNode: ComponentNode) => {
                    eventHandlers.onTargetChange?.(oldTargetNode, newTargetNode);
                    this.onTargetChange(oldTargetNode, newTargetNode);
                },
                ...eventHandlers,
            },
        });
    }

    getNodeFromModel(model: Component): ComponentNode {
        return new ComponentNode(model);
    }

    onComponentStartSort = (sourceNode: ComponentNode) => {
        this.em.clearSelection();
        this.toggleSortCursor(true);
        this.em.trigger('sorter:drag:start', sourceNode?.getElement(), sourceNode?.getmodel());
    }

    onComponentDrop = (targetNode: ComponentNode, sourceNode: ComponentNode, index: number) => {
        sourceNode.getmodel().set('status', '');
        if (targetNode) {
            const parent = sourceNode.getParent();
            if (parent) {
                parent.removeChildAt(parent.indexOfChild(sourceNode))
            }

            targetNode.addChildAt(sourceNode, index);
        }

        this.placeholder.hide();
    }

    onTargetChange = (oldTargetNode: ComponentNode, newTargetNode: ComponentNode) => {
        oldTargetNode && oldTargetNode?.getmodel()?.set('status', '');
        newTargetNode?.getmodel()?.set('status', 'selected-parent');
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

    setSelection(node: ComponentNode, selected: Boolean) {
        const model = node.getmodel();
        const cv = this.em!.Canvas;
        const { Select, Hover, Spacing } = CanvasSpotBuiltInTypes;
        [Select, Hover, Spacing].forEach((type) => cv.removeSpots({ type }));
        cv.addSpot({ ...spotTarget, component: model as any });
        model.set('status', selected ? 'selected-parent' : '');
    }
}