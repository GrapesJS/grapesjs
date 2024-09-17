import { bindAll, isFunction, contains } from 'underscore';
import { $, View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { off, on } from '../dom';
import { SortableTreeNode } from './SortableTreeNode';
import { DropLocationDeterminer } from './DropLocationDeterminer';
import { PlaceholderClass } from './PlaceholderClass';
import { getMergedOptions, getDocuments, matches, closest } from './SorterUtils';
import { SorterContainerContext, PositionOptions, SorterDragBehaviorOptions, SorterEventHandlers, Dimension, Position } from './types';
import { SorterOptions } from './types';

export type RequiredEmAndTreeClassPartialSorterOptions<T> = Partial<SorterOptions<T>> & {
  em: EditorModel;
  treeClass: new (model: T) => SortableTreeNode<T>;
};

export default class Sorter<T> extends View {
  em!: EditorModel;
  treeClass!: new (model: T) => SortableTreeNode<T>;
  placeholder!: PlaceholderClass;
  dropLocationDeterminer!: DropLocationDeterminer<T>;

  positionOptions!: PositionOptions;
  containerContext!: SorterContainerContext;
  dragBehavior!: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers<T>;

  options!: SorterOptions<T>;
  docs: any;
  sourceNode?: SortableTreeNode<T>;
  // TODO
  // @ts-ignore
  initialize(sorterOptions: RequiredEmAndTreeClassPartialSorterOptions<T> = {}) {
    const mergedOptions: Omit<SorterOptions<T>, 'em' | 'treeClass'> = getMergedOptions<T>(sorterOptions);

    bindAll(this, 'startSort', 'endMove', 'rollback', 'updateOffset');
    this.containerContext = mergedOptions.containerContext;
    this.positionOptions = mergedOptions.positionOptions;
    this.dragBehavior = mergedOptions.dragBehavior;
    this.eventHandlers = mergedOptions.eventHandlers;

    this.em = sorterOptions.em;
    this.treeClass = sorterOptions.treeClass;
    const el = mergedOptions.containerContext.container;
    this.el = typeof el === 'string' ? document.querySelector(el)! : el!;
    this.updateOffset();

    if (this.em?.on) {
      this.em.on(this.em.Canvas.events.refresh, this.updateOffset);
    }

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

  private getContainerEl(elem?: HTMLElement) {
    if (elem) this.el = elem;

    if (!this.el) {
      var el = this.containerContext.container;
      this.el = typeof el === 'string' ? document.querySelector(el)! : el!;
    }

    return this.el;
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
   * Picking component to move
   * @param {HTMLElement} sourceElement
   * */
  startSort(sourceElement?: HTMLElement, options: { container?: HTMLElement } = {}) {
    if (!!options.container) {
      this.updateContainer(options.container);
    }

    // Check if the start element is a valid one, if not, try the closest valid one
    if (sourceElement && !matches(sourceElement, `${this.containerContext.itemSel}, ${this.containerContext.containerSel}`)) {
      sourceElement = closest(sourceElement, this.containerContext.itemSel)!;
    }

    const sourceModel = $(sourceElement).data("model");
    this.sourceNode = new this.treeClass(sourceModel)
    const docs = getDocuments(this.em, sourceElement);
    this.updateDocs(docs)
    this.dropLocationDeterminer.startSort(sourceElement);
    this.bindDragEventHandlers(docs);

    if (this.eventHandlers && isFunction(this.eventHandlers.onStartSort)) {
      this.eventHandlers.onStartSort(this.sourceNode!, this.containerContext.container)
    }
  }

  private bindDragEventHandlers(docs: Document[]) {
    on(docs, 'keydown', this.rollback);
  }

  private updateContainer(container: HTMLElement) {
    const newContainer = this.getContainerEl(container);

    this.dropLocationDeterminer.updateContainer(newContainer);
  }

  private updateDocs(docs: Document[]) {
    this.docs = docs
    this.dropLocationDeterminer.updateDocs(docs);
  }

  private updatePlaceholderPosition(dims: Dimension[], pos: Position) {
    this.placeholder.move(dims, pos)
  }

  /**
   * End the move action.
   * Handles the cleanup and final steps after an item is moved.
   */
  endMove(): void {
    const container = this.getContainerEl();
    const docs = this.docs;
    this.cleanupEventListeners(container, docs);
    this.placeholder.hide();
    this.finalizeMove();
  }

  /**
   * Clean up event listeners that were attached during the move.
   *
   * @param {HTMLElement} container - The container element.
   * @param {Document[]} docs - List of documents.
   * @private
   */
  private cleanupEventListeners(container: HTMLElement, docs: Document[]): void {
    off(docs, 'keydown', this.rollback);
  }

  /**
   * Finalize the move by removing any helpers and selecting the target model.
   * 
   * @private
   */
  private finalizeMove(): void {
    // @ts-ignore
    this.em?.Canvas.removeSpots(this.spotTarget);
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
      // TODO add canceling
    }
  }
}
