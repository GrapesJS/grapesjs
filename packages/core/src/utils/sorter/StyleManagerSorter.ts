import EditorModel from "../../editor/model/Editor";
import Layer from "../../style_manager/model/Layer";
import Layers from "../../style_manager/model/Layers";
import { LayerNode } from "./LayerNode";
import Sorter from "./Sorter";
import { SorterContainerContext, PositionOptions, SorterDragBehaviorOptions, SorterEventHandlers } from './types';

export default class StyleManagerSorter extends Sorter<Layers | Layer> {
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
        eventHandlers?: SorterEventHandlers<Layer | Layers>;
    }) {
        super({
            em,
            treeClass: LayerNode,
            containerContext,
            positionOptions,
            dragBehavior,
            eventHandlers: {
                onStartSort: (sourceNode: LayerNode, containerElement?: HTMLElement) => {
                    eventHandlers.onStartSort?.(sourceNode, containerElement);
                    this.onLayerStartSort(sourceNode);
                },
                onDrop: (targetNode: LayerNode, sourceNode: LayerNode, index: number) => {
                    eventHandlers.onDrop?.(targetNode, sourceNode, index);
                    this.onLayerDrop(targetNode, sourceNode, index);
                },
                ...eventHandlers,
            },
        });
    }

    onLayerStartSort = (sourceNode: LayerNode) => {
        this.em.clearSelection();
        this.em.trigger('sorter:drag:start', sourceNode?.element, sourceNode?.model);
    }

    onLayerDrop = (targetNode: LayerNode, sourceNode: LayerNode, index: number) => {
        if (targetNode) {
            const parent = sourceNode.getParent();
            let initialSourceIndex = -1;
            if (parent) {
                initialSourceIndex = parent.indexOfChild(sourceNode);
                parent.removeChildAt(initialSourceIndex)
            }
            index = initialSourceIndex < index ? index - 1 : index;

            targetNode.addChildAt(sourceNode, index);
        }

        this.placeholder.hide();
    }
}