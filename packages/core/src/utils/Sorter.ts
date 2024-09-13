import { bindAll } from 'underscore';
import CanvasModule from '../canvas';
import { CanvasSpotBuiltInTypes } from '../canvas/model/CanvasSpot';
import { $, Model, View } from '../common';
import EditorModel from '../editor/model/Editor';
import { off, on } from './dom';
import { TreeSorterBase } from './TreeSorterBase';
import { DropLocationDeterminer } from './DropLocationDeterminer';
import Component from '../dom_components/model/Component';
import { PlaceholderClass } from './PlaceholderClass';
import { getMergedOptions, setContentEditable, getDocuments, matches, closest, isTextableActive, findPosition, offset, disableTextable, nearBorders, nearElBorders, getCurrentPos, isInFlow, parents, sort } from './SorterUtils';

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
  windowMargin: number;
  borderOffset: number;
  offsetTop: number;
  offsetLeft: number;
  canvasRelative?: boolean;
  scale: number;
  relative: boolean;
}

export interface SorterEventHandlers {
  onStart?: Function;
  onMove?: Function;
  onEndMove?: Function;
  onEnd?: Function;
}

export interface SorterDragBehaviorOptions {
  dragDirection: SorterDirection;
  ignoreViewChildren?: boolean;
  nested?: boolean;
  selectOnEnd: boolean;
}

export interface SorterOptions<T> {
  em?: EditorModel;
  treeClass: new (model: T) => TreeSorterBase<T>;

  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers;
}

const targetSpotType = CanvasSpotBuiltInTypes.Target;

const spotTarget = {
  id: 'sorter-target',
  type: targetSpotType,
};

export type RequiredEmAndTreeClassPartialSorterOptions<T> = Partial<SorterOptions<T>> & {
  em: EditorModel;
  treeClass: new (model: T) => TreeSorterBase<T>;
};

export default class Sorter<T> extends View {
  em?: EditorModel;
  treeClass!: new (model: any) => TreeSorterBase<T>;
  placeholder!: PlaceholderClass;
  dropLocationDeterminer!: DropLocationDeterminer<T>;

  positionOptions!: PositionOptions;
  containerContext!: SorterContainerContext;
  dragBehavior!: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers;

  options!: SorterOptions<T>;

  targetElement?: HTMLElement;
  prevTargetElement?: HTMLElement;
  sourceElement?: HTMLElement;
  sourceModel?: Model;
  docs!: Document[];

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
    this.treeClass = sorterOptions.treeClass;

    this.updateOffset();
    if (this.em?.on) {
      this.em.on(this.em.Canvas.events.refresh, this.updateOffset);
    }
    let lastHighlighted: HTMLElement;
    const onMove = (...args: any) => {
      const targetEl: HTMLElement = args[0]
      if (targetEl) {
        // targetEl.style.border = "black 3px dashed"
      }

      const targetModel: Component = args[1]
      if (targetModel?.view) {
        // if (targetModel.view.el !== lastHighlighted) {
        //   if (lastHighlighted) {
        //     lastHighlighted.style.border = "";
        //   }
        //   targetModel.view.el.style.border = "black 3px dashed";
        //   lastHighlighted = targetModel.view.el;
        // }
      }

      const targetNode: TreeSorterBase<T> = args[2];
      if (targetNode) {
        // console.log(targetNode);
      }

      const pos = args[3]
      // console.log(pos);

      const sourceNode = args[4];
      // console.log(sourceNode)

      const canMoveSourceIntoTarget = targetNode.canMove(sourceNode, 0)
      // console.log("🚀 ~ Sorter<T> ~ c ~ canMoveSourceIntoTarget:", canMoveSourceIntoTarget)

      const finalNode: TreeSorterBase<Component> = args[5];
      if (finalNode && finalNode.model && finalNode.model?.view) {
        const finalNodeModel = finalNode.model;
        const finalElement = finalNodeModel!.view!.el!;
        if (finalElement !== lastHighlighted) {
          if (lastHighlighted) {
            lastHighlighted.style.border = "";
          }
          finalElement.style.border = "black 3px dashed";
          lastHighlighted = finalElement;
        }
      }
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
        top: this.positionOptions.offsetTop,
        left: this.positionOptions.offsetLeft
      }
    })

    const onDrop = (targetNode: TreeSorterBase<T>, index: number) => {
      console.log(targetNode.getChildren()?.length, index);
      if (targetNode) {
        // @ts-ignore
        targetNode.model.view.el.style.border = '3px red solid';
        const sourceNode = new this.treeClass(this.getSourceModel())
        const parent = sourceNode.getParent();
        if (parent) {
          parent.removeChildAt(parent.indexOfChild(sourceNode))
        }

        targetNode.addChildAt(sourceNode, index);
      }

      this.clearFreeze();
      this.placeholder.hide();
    }

    this.dropLocationDeterminer = new DropLocationDeterminer({
      em: this.em,
      treeClass: this.treeClass,
      containerContext: this.containerContext,
      positionOptions: this.positionOptions,
      dragBehavior: this.dragBehavior,
      eventHandlers: this.eventHandlers,
    }, onMove.bind(this), onDropPositionChange.bind(this), onDrop.bind(this));
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

  /**
   * Picking component to move
   * @param {HTMLElement} src
   * */
  startSort(src?: HTMLElement, opts: { container?: HTMLElement } = {}) {
    if (!!opts.container) {
      this.updateContainer(opts.container);
    }
    const docs = getDocuments(this.em, src);
    this.updateDocs(docs)
    this.dropLocationDeterminer.startSort(src, opts);
    this.resetDragStates();

    this.sourceElement = src;
    if (src) {
      this.sourceModel = this.getSourceModel(src);
    }

    this.bindDragEventHandlers(docs);
    this.toggleSortCursor(true);
    this.emitSorterStart(src);
  }

  private bindDragEventHandlers(docs: Document[]) {
    on(docs, 'keydown', this.rollback);
  }

  private emitSorterStart(src: HTMLElement | undefined) {
    this.em?.trigger('sorter:drag:start', src, this.sourceModel);
  }

  private resetDragStates() {
    delete this.targetElement;
  }

  private updateContainer(container: HTMLElement) {
    const newContainer = this.getContainerEl(container);

    this.dropLocationDeterminer.updateContainer(newContainer);
  }

  private updateDocs(docs: Document[]) {
    this.docs = docs
    this.dropLocationDeterminer.updateDocs(docs);
  }

  /**
   * Get the model of the current source element (element to drag)
   * @return {Model}
   */
  private getSourceModel(source?: HTMLElement, { target, avoidChildren = 1 }: any = {}): Model {
    const { sourceElement } = this;
    const src = source || sourceElement;

    return src && $(src).data('model');
  }

  private clearFreeze() {
    this.sourceModel?.set && this.sourceModel.set('status', '');
  }

  private updatePlaceholderPosition(dims: Dimension[], pos: Position, prevTargetDim: Dimension) {
    this.placeholder.move(dims, pos, prevTargetDim)
  }

  /**
   * End the move action.
   * Handles the cleanup and final steps after an item is moved.
   */
  endMove(): void {
    const { sourceElement } = this;
    const container = this.getContainerEl();
    const docs = this.docs;
    let srcModel;

    this.cleanupEventListeners(container, docs);
    this.placeholder.hide();

    if (sourceElement) {
      srcModel = this.getSourceModel();
    }

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
    this.clearFreeze();
    this.toggleSortCursor();
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
