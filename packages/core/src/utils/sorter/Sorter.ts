import { bindAll } from 'underscore';
import { $ } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { off, on } from '../dom';
import { SortableTreeNode } from './SortableTreeNode';
import { DragSource } from './types';
import { DropLocationDeterminer } from './DropLocationDeterminer';
import { PlaceholderClass } from './PlaceholderClass';
import { getMergedOptions, getDocument, matches, closest, sortDom } from './SorterUtils';
import {
  SorterContainerContext,
  PositionOptions,
  SorterDragBehaviorOptions,
  SorterEventHandlers,
  Placement,
} from './types';
import Dimension from './Dimension';
import { SorterOptions } from './types';

export default class Sorter<T, NodeType extends SortableTreeNode<T>> {
  em: EditorModel;
  treeClass: new (model: T, dragSource?: DragSource<T>) => NodeType;
  placeholder: PlaceholderClass;
  dropLocationDeterminer: DropLocationDeterminer<T, NodeType>;

  positionOptions: PositionOptions;
  containerContext: SorterContainerContext;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers: SorterEventHandlers<NodeType>;
  sourceNodes?: NodeType[];
  constructor(sorterOptions: SorterOptions<T, NodeType>) {
    const mergedOptions = getMergedOptions<T, NodeType>(sorterOptions);

    bindAll(
      this,
      'startSort',
      'cancelDrag',
      'recalculateTargetOnScroll',
      'rollback',
      'updateOffset',
      'handlePlaceholderMove',
      'finalizeMove',
    );
    this.containerContext = mergedOptions.containerContext;
    this.positionOptions = mergedOptions.positionOptions;
    this.dragBehavior = mergedOptions.dragBehavior;
    this.eventHandlers = {
      ...mergedOptions.eventHandlers,
      onPlaceholderPositionChange: this.handlePlaceholderMove,
      onEnd: this.finalizeMove,
    };

    this.em = sorterOptions.em;
    this.treeClass = sorterOptions.treeClass;
    this.updateOffset();
    this.em.on(this.em.Canvas.events.refresh, this.updateOffset);
    this.placeholder = this.createPlaceholder();

    this.dropLocationDeterminer = new DropLocationDeterminer({
      em: this.em,
      treeClass: this.treeClass,
      containerContext: this.containerContext,
      positionOptions: this.positionOptions,
      dragDirection: this.dragBehavior.dragDirection,
      eventHandlers: this.eventHandlers,
    });
  }

  /**
   * Picking components to move
   * @param {HTMLElement[]} sources[]
   * */
  startSort(sources: { element?: HTMLElement; dragSource?: DragSource<T> }[]) {
    const validSources = sources.filter((source) => !!source.dragSource || this.findValidSourceElement(source.element));

    const sourcesWithModel: { model: T; content?: any }[] = validSources.map((source) => {
      return {
        model: $(source.element)?.data('model'),
        content: source.dragSource,
      };
    });
    const sortedSources = sourcesWithModel.sort((a, b) => {
      return sortDom(a.model, b.model);
    });
    const sourceNodes = sortedSources.map((source) => new this.treeClass(source.model, source.content));
    this.sourceNodes = sourceNodes;
    this.dropLocationDeterminer.startSort(sourceNodes);
    this.bindDragEventHandlers();

    this.eventHandlers.onStartSort?.(this.sourceNodes, this.containerContext.container);

    // For backward compatibility, leave it to a single node
    const model = this.sourceNodes[0]?.model;
    this.eventHandlers.legacyOnStartSort?.({
      sorter: this,
      target: model,
      // @ts-ignore
      parent: model && model.parent?.(),
      // @ts-ignore
      index: model && model.index?.(),
    });

    // For backward compatibility, leave it to a single node
    this.em.trigger('sorter:drag:start', sources[0], sourcesWithModel[0]);
  }

  /**
   * This method is should be called when the user scrolls within the container.
   */
  protected recalculateTargetOnScroll(): void {
    this.dropLocationDeterminer.recalculateTargetOnScroll();
  }

  /**
   * Called when the drag operation should be cancelled
   */
  cancelDrag(): void {
    this.triggerNullOnEndMove(true);
    this.dropLocationDeterminer.cancelDrag();
  }

  /**
   * Called to drop an item onto a valid target.
   */
  endDrag() {
    this.dropLocationDeterminer.endDrag();
  }

  private handlePlaceholderMove(elementDimension: Dimension, placement: Placement) {
    this.ensurePlaceholderElement();
    this.updatePlaceholderPosition(elementDimension, placement);
  }

  /**
   * Creates a new placeholder element for the drag-and-drop operation.
   *
   * @returns {PlaceholderClass} The newly created placeholder instance.
   */
  private createPlaceholder(): PlaceholderClass {
    return new PlaceholderClass({
      container: this.containerContext.container,
      allowNesting: this.dragBehavior.nested,
      pfx: this.containerContext.pfx,
      el: this.containerContext.placeholderElement,
      offset: {
        top: this.positionOptions.offsetTop!,
        left: this.positionOptions.offsetLeft!,
      },
    });
  }

  private ensurePlaceholderElement() {
    const el = this.placeholder.el;
    const container = this.containerContext.container;
    if (!el.ownerDocument.contains(el)) {
      container.append(this.placeholder.el);
    }
  }

  /**
   * Triggered when the offset of the editor is changed
   */
  private updateOffset() {
    const offset = this.em?.get('canvasOffset') || {};
    this.positionOptions.offsetTop = offset.top;
    this.positionOptions.offsetLeft = offset.left;
  }

  /**
   * Finds the closest valid source element within the container context.
  
   * @param sourceElement - The initial source element to check.
   * @returns The closest valid source element, or null if none is found.
   */
  private findValidSourceElement(sourceElement?: HTMLElement): HTMLElement | undefined {
    if (
      sourceElement &&
      !matches(sourceElement, `${this.containerContext.itemSel}, ${this.containerContext.containerSel}`)
    ) {
      sourceElement = closest(sourceElement, this.containerContext.itemSel)!;
    }

    return sourceElement;
  }

  protected bindDragEventHandlers() {
    on(this.containerContext.document, 'keydown', this.rollback);
  }

  private updatePlaceholderPosition(targetDimension: Dimension, placement: Placement) {
    this.placeholder.move(targetDimension, placement);
  }

  /**
   * Clean up event listeners that were attached during the move.
   *
   * @private
   */
  protected cleanupEventListeners(): void {
    off(this.containerContext.document, 'keydown', this.rollback);
  }

  /**
   * Finalize the move.
   *
   * @private
   */
  protected finalizeMove(): void {
    this.cleanupEventListeners();
    this.placeholder.hide();
    delete this.sourceNodes;
  }

  /**
   * Cancels the drag on Escape press ( nothing is dropped or moved )
   * @param {KeyboardEvent} e - The keyboard event object.
   */
  private rollback(e: KeyboardEvent) {
    off(this.containerContext.document, 'keydown', this.rollback);
    const ESC_KEY = 'Escape';

    if (e.key === ESC_KEY) {
      this.cancelDrag();
    }
  }

  // For the old sorter
  protected triggerNullOnEndMove(dragIsCancelled: boolean) {
    const model = this.sourceNodes?.[0].model;
    const data = {
      target: model,
      // @ts-ignore
      parent: model && model.parent?.(),
      // @ts-ignore
      index: model && model.index?.(),
    };

    this.eventHandlers.legacyOnEndMove?.(null, this, { ...data, cancelled: dragIsCancelled });
  }
}
