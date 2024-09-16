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
            // @ts-ignore
            em,
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
                onDragStart: () => {
                    this.onDragStart()
                },
                ...eventHandlers,
            },
        });
    }

    getNodeFromModel(model: Layer): LayerNode {
        return new LayerNode(model);
    }

    onLayerStartSort = (sourceNode: LayerNode) => {
        this.em.clearSelection();
        this.em.trigger('sorter:drag:start', sourceNode?.getElement(), sourceNode?.getmodel());
    }

    onLayerDrop = (targetNode: LayerNode, sourceNode: LayerNode, index: number) => {
        if (targetNode) {
            const parent = sourceNode.getParent();
            if (parent) {
                parent.removeChildAt(parent.indexOfChild(sourceNode))
            }

            targetNode.addChildAt(sourceNode, index);
        }

        this.placeholder.hide();
    }

    onDragStart() {
        this.containerContext.container.appendChild(this.placeholder.el);
    }

    /**
* Create placeholder
* @return {HTMLElement}
*/
    private createPlaceholder() {
        const pfx = this.containerContext.pfx;
        const el = document.createElement('div');
        const ins = document.createElement('div');
        el.className = pfx + 'placeholder';
        el.style.display = 'none';
        el.style.pointerEvents = 'none';
        ins.className = pfx + 'placeholder-int';
        el.appendChild(ins);
        this.containerContext.container.appendChild(el);

        return el;
    }
}