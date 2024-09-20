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
  customTarget?: ({ event }: { event: MouseEvent }) => HTMLElement | null;
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
 * @param sourceNodes The source nodes being sorted.
 * @param container The container element where the sorting is taking place.
 */
type OnStartSortHandler<NodeType> = (sourceNodes: NodeType[], container?: HTMLElement) => void;

/**
 * Represents an event handler for the `onDragStart` event.
 *
 * @param mouseEvent The mouse event associated with the drag start.
 */
type OnDragStartHandler = (mouseEvent: MouseEvent) => void;
type OnMouseMoveHandler = (mouseEvent: MouseEvent) => void;
type OnDropHandler<NodeType> = (targetNode: NodeType | undefined, sourceNodes: NodeType[], index: number) => void;
type OnTargetChangeHandler<NodeType> = (oldTargetNode: NodeType | undefined, newTargetNode: NodeType | undefined) => void;
type OnPlaceholderPositionChangeHandler = (dims: Dimension[], newPosition: Position) => void;
type OnEndMoveHandler = () => void;

/**
 * Represents a collection of event handlers for sortable tree node events.
 */
export interface SorterEventHandlers<NodeType> {
  onStartSort?: OnStartSortHandler<NodeType>;
  onDragStart?: OnDragStartHandler;
  onMouseMove?: OnMouseMoveHandler;
  onDrop?: OnDropHandler<NodeType>;
  onTargetChange?: OnTargetChangeHandler<NodeType>;
  onPlaceholderPositionChange?: OnPlaceholderPositionChangeHandler;
  onEndMove?: OnEndMoveHandler;

  // For compatibility with old sorter
  legacyOnMoveClb?: Function;
  legacyOnStartSort?: Function;
  legacyOnEndMove?: Function;
  legacyOnEnd?: Function;
}

export interface SorterDragBehaviorOptions {
  dragDirection: SorterDirection;
  ignoreViewChildren?: boolean;
  nested?: boolean;
  selectOnEnd?: boolean;
}

export interface SorterOptions<T, NodeType extends SortableTreeNode<T>> {
  em: EditorModel;
  treeClass: new (model: T) => NodeType;

  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers: SorterEventHandlers<NodeType>;
}

