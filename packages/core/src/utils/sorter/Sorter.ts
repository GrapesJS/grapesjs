import { bindAll } from 'underscore';
import { $ } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { off, on } from '../dom';
import { SortableTreeNode } from './SortableTreeNode';
import { DropLocationDeterminer } from './DropLocationDeterminer';
import { PlaceholderClass } from './PlaceholderClass';
import { getMergedOptions, getDocument, matches, closest } from './SorterUtils';
import { SorterContainerContext, PositionOptions, SorterDragBehaviorOptions, SorterEventHandlers, Dimension, Position } from './types';
import { SorterOptions } from './types';

export type RequiredEmAndTreeClassPartialSorterOptions<T, NodeType extends SortableTreeNode<T>> = Partial<SorterOptions<T, NodeType>> & {
  em: EditorModel;
  treeClass: new (model: T) => NodeType;
};
export default class Sorter<T, NodeType extends SortableTreeNode<T>> {
  em: EditorModel;
  treeClass: new (model: T) => NodeType;
  placeholder: PlaceholderClass;
  dropLocationDeterminer: DropLocationDeterminer<T, NodeType>;

  positionOptions: PositionOptions;
  containerContext: SorterContainerContext;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers: SorterEventHandlers<NodeType>;

  docs: any;
  sourceNodes?: NodeType[];
  constructor(sorterOptions: SorterOptions<T, NodeType>) {
    const mergedOptions = getMergedOptions<T, NodeType>(sorterOptions);

    bindAll(this, 'startSort', 'cancelDrag', 'rollback', 'updateOffset');
    this.containerContext = mergedOptions.containerContext;
    this.positionOptions = mergedOptions.positionOptions;
    this.dragBehavior = mergedOptions.dragBehavior;
    this.eventHandlers = mergedOptions.eventHandlers;

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
      dragBehavior: this.dragBehavior,
      eventHandlers: {
        ...this.eventHandlers,
        onPlaceholderPositionChange: ((
          dims: Dimension[],
          newPosition: Position) => {
          this.ensurePlaceholderElement();
          this.placeholder.show();
          this.updatePlaceholderPosition(dims, newPosition);
        }).bind(this)
      },
    });
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
        left: this.positionOptions.offsetLeft!
      }
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
   * Picking components to move
   * @param {HTMLElement[]} sourceElements[]
   * */
  startSort(sourceElements: HTMLElement[]) {
    const validSourceElements = sourceElements.map(element => this.findValidSourceElement(element))

    const sourceModels: T[] = validSourceElements.map(element => $(element).data("model"))
    const sourceNodes = sourceModels.map(model => new this.treeClass(model));
    this.sourceNodes = sourceNodes;
    const uniqueDocs = new Set<Document>();
    validSourceElements.forEach((element) => {
      const doc = getDocument(this.em, element);
      if (doc) {
        uniqueDocs.add(doc);
      }
    });

    const docs = Array.from(uniqueDocs);
    this.updateDocs(docs)
    this.dropLocationDeterminer.startSort(sourceNodes);
    this.bindDragEventHandlers(docs);

    this.eventHandlers.onStartSort?.(this.sourceNodes, this.containerContext.container);
    // Only take a single value as the old sorted
    this.em.trigger('sorter:drag:start', sourceElements[0], sourceModels[0]);
  }

  /**
   * Finds the closest valid source element within the container context.
  
   * @param sourceElement - The initial source element to check.
   * @returns The closest valid source element, or null if none is found.
   */
  private findValidSourceElement(sourceElement?: HTMLElement): HTMLElement | undefined {
    if (sourceElement && !matches(sourceElement, `${this.containerContext.itemSel}, ${this.containerContext.containerSel}`)) {
      sourceElement = closest(sourceElement, this.containerContext.itemSel)!;
    }

    return sourceElement;
  }

  private bindDragEventHandlers(docs: Document[]) {
    on(docs, 'keydown', this.rollback);
  }

  private updateDocs(docs: Document[]) {
    this.docs = docs
    this.dropLocationDeterminer.updateDocs(docs);
  }

  private updatePlaceholderPosition(dims: Dimension[], pos: Position) {
    this.placeholder.move(dims, pos)
  }

  /**
   * Called when the drag operation should be cancelled
  */
 cancelDrag(): void {
   this.placeholder.hide();
   this.dropLocationDeterminer.cancelDrag()
   this.finalizeMove();
  }
  
  /**
   * Called to drop an item onto a valid target.
  */
  endDrag() {
    this.dropLocationDeterminer.endDrag()
  }

  /**
   * Clean up event listeners that were attached during the move.
   *
   * @param {Document[]} docs - List of documents.
   * @private
   */
  private cleanupEventListeners(docs: Document[]): void {
    off(docs, 'keydown', this.rollback);
  }

  /**
   * Finalize the move.
   * 
   * @private
   */
  protected finalizeMove(): void {
    const docs = this.docs;
    this.cleanupEventListeners(docs);
    this.eventHandlers.legacyOnEnd?.({ sorter: this })
  }

  /**
   * Rollback to previous situation.
   *
   * @param {KeyboardEvent} e - The keyboard event object.
   */
  private rollback(e: KeyboardEvent) {
    off(this.docs, 'keydown', this.rollback);
    const ESC_KEY = 'Escape';

    if (e.key === ESC_KEY) {
      this.cancelDrag();
    }
  }
}
