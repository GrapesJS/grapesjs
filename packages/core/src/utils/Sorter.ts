import { bindAll, isFunction } from 'underscore';
import CanvasModule from '../canvas';
import { $, View } from '../common';
import EditorModel from '../editor/model/Editor';
import { off, on } from './dom';
import { TreeSorterBase } from './TreeSorterBase';
import { DropLocationDeterminer } from './DropLocationDeterminer';
import { PlaceholderClass } from './PlaceholderClass';
import { getMergedOptions, getDocuments } from './SorterUtils';

export interface Dimension {
  top: number;
  left: number;
  height: number;
  width: number;
  offsets: ReturnType<CanvasModule['getElementOffsets']>;
  dir?: boolean;
  el?: HTMLElement;
  indexEl?: number;
}

export interface Position {
  index: number;
  indexEl: number;
  method: string;
}

export enum SorterDirection {
  Vertical = "Vertical",
  Horizontal = "Horizontal",
  BothDirections = "BothDirections"
}

export interface SorterContainerContext {
  container: HTMLElement;
  containerSel: string;
  itemSel: string;
  pfx: string;
  document: Document;
  placeholderElement?: HTMLElement;
  customTarget?: Function;
}

export interface PositionOptions {
  windowMargin?: number;
  borderOffset?: number;
  offsetTop?: number;
  offsetLeft?: number;
  canvasRelative?: boolean;
  scale?: number;
  relative?: boolean;
}

export interface SorterEventHandlers<T> {
  onStartSort?: (sourceNode: TreeSorterBase<T>, container?: HTMLElement) => void;
  onMouseMove?: Function;
  onDrop?: (targetNode: TreeSorterBase<T>, sourceNode: TreeSorterBase<T>, index: number) => void;
  onCancel?: Function;
  onEndMove?: Function;
  onTargetChange?: (oldTargetNode: TreeSorterBase<T>, newTargetNode: TreeSorterBase<T>) => void;
}

export interface SorterDragBehaviorOptions {
  dragDirection: SorterDirection;
  ignoreViewChildren?: boolean;
  nested?: boolean;
  selectOnEnd?: boolean;
}

export interface SorterOptions<T> {
  em: EditorModel;
  treeClass: new (model: T) => TreeSorterBase<T>;

  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers<T>;
}

export type RequiredEmAndTreeClassPartialSorterOptions<T> = Partial<SorterOptions<T>> & {
  em: EditorModel;
  treeClass: new (model: T) => TreeSorterBase<T>;
};

export default class Sorter<T> extends View {
  em!: EditorModel;
  placeholder!: PlaceholderClass;
  dropLocationDeterminer!: DropLocationDeterminer<T>;

  positionOptions!: PositionOptions;
  containerContext!: SorterContainerContext;
  dragBehavior!: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers<T>;

  options!: SorterOptions<T>;
  docs: any;
  sourceNode?: TreeSorterBase<T>;

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
    var el = mergedOptions.containerContext.container;
    this.el = typeof el === 'string' ? document.querySelector(el)! : el!;

    this.updateOffset();
    if (this.em?.on) {
      this.em.on(this.em.Canvas.events.refresh, this.updateOffset);
    }
    const onDropPositionChange = (
      dims: Dimension[],
      newPosition: Position,
      targetDimension: Dimension) => {
      if (newPosition) {
        this.placeholder.show();
        this.updatePlaceholderPosition(dims, newPosition, targetDimension);
      }
    }

    this.placeholder = new PlaceholderClass({
      container: this.containerContext.container,
      allowNesting: this.dragBehavior.nested,
      el: this.containerContext.placeholderElement,
      offset: {
        top: this.positionOptions.offsetTop!,
        left: this.positionOptions.offsetLeft!
      }
    })

    this.dropLocationDeterminer = new DropLocationDeterminer({
      em: this.em,
      treeClass: this.getNodeFromModel,
      containerContext: this.containerContext,
      positionOptions: this.positionOptions,
      dragBehavior: this.dragBehavior,
      eventHandlers: this.eventHandlers,
    }, onDropPositionChange.bind(this));
  }

  // TODO
  getNodeFromModel(model: T) {
    return '' as any;
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
    const sourceModel = $(sourceElement).data("model");
    this.sourceNode = this.getNodeFromModel(sourceModel)
    const docs = getDocuments(this.em, sourceElement);
    this.updateDocs(docs)
    this.dropLocationDeterminer.startSort(sourceElement, options);
    this.bindDragEventHandlers(docs);

    if (this.eventHandlers && isFunction(this.eventHandlers.onStartSort)) {
      this.eventHandlers.onStartSort(this.sourceNode!, options.container)
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

  // TODO move to componentSorter
  // private clearFreeze() {
  //   this.sourceModel?.set && this.sourceModel.set('status', '');
  // }

  private updatePlaceholderPosition(dims: Dimension[], pos: Position, prevTargetDim: Dimension) {
    this.placeholder.move(dims, pos, prevTargetDim)
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
