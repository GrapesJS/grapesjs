import CanvasModule from '../../canvas';
import EditorModel from '../../editor/model/Editor';
import { SortableTreeNode } from './SortableTreeNode';

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
  placeholderElement: HTMLElement;
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

/**
 * Represents an event handler for the `onStartSort` event.
 *
 * @param sourceNode The source node being sorted.
 * @param container The container element where the sorting is taking place.
 */
type OnStartSortHandler<T> = (sourceNode: SortableTreeNode<T>, container?: HTMLElement) => void;

/**
 * Represents an event handler for the `onDragStart` event.
 *
 * @param mouseEvent The mouse event associated with the drag start.
 */
type OnDragStartHandler = (mouseEvent: MouseEvent) => void;
type OnMouseMoveHandler = (mouseEvent: MouseEvent) => void;
type OnDropHandler<T> = (targetNode: SortableTreeNode<T>, sourceNode: SortableTreeNode<T>, index: number) => void;
type OnTargetChangeHandler<T> = (oldTargetNode: SortableTreeNode<T>, newTargetNode: SortableTreeNode<T>) => void;
type OnPlaceholderPositionChangeHandler = (dims: Dimension[], newPosition: Position) => void;
type OnEndMoveHandler = () => void;
// For compatibility with old sorter
type onMoveClb = (data: any) => void;

/**
 * Represents a collection of event handlers for sortable tree node events.
 */
export interface SorterEventHandlers<T> {
  onStartSort?: OnStartSortHandler<T>;
  onDragStart?: OnDragStartHandler;
  onMouseMove?: OnMouseMoveHandler;
  onDrop?: OnDropHandler<T>;
  onTargetChange?: OnTargetChangeHandler<T>;
  onPlaceholderPositionChange?: OnPlaceholderPositionChangeHandler;
  onEndMove?: OnEndMoveHandler;
  // For compatibility with old sorter
  onMoveClb?: onMoveClb;
}

export interface SorterDragBehaviorOptions {
  dragDirection: SorterDirection;
  ignoreViewChildren?: boolean;
  nested?: boolean;
  selectOnEnd?: boolean;
}

export interface SorterOptions<T> {
  em: EditorModel;
  treeClass: new (model: T) => SortableTreeNode<T>;

  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers<T>;
}

