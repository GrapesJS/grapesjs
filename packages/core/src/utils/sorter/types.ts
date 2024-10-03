import CanvasModule from '../../canvas';
import { ComponentDefinition } from '../../dom_components/model/types';
import EditorModel from '../../editor/model/Editor';
import { SortableTreeNode } from './SortableTreeNode';

export type ContentType = string | ComponentDefinition | (string | ComponentDefinition)[];

export interface DraggableContent {
  /**
   * Determines if a block can be moved inside a given component when the content is a function.
   *
   * This property is used to determine the validity of the drag operation.
   * @type {ComponentDefinition | undefined}
   */
  dragDef?: ComponentDefinition;
  /**
   * The content being dragged. Might be an HTML string or a [Component Defintion](/modules/Components.html#component-definition)
   */
  content?: ContentType | (() => ContentType);
}

export type DragSource<T> = DraggableContent & {
  symbolModel?: T; // For passing main symbol model
};

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

export type Placement = 'inside' | 'before' | 'after';

export enum DragDirection {
  Vertical = 'Vertical',
  Horizontal = 'Horizontal',
  BothDirections = 'BothDirections',
}

export type CustomTarget = ({ event }: { event: MouseEvent }) => HTMLElement | null;

export interface SorterContainerContext {
  container: HTMLElement;
  containerSel: string;
  itemSel: string;
  pfx: string;
  document: Document;
  placeholderElement: HTMLElement;
  customTarget?: CustomTarget;
}

export interface PositionOptions {
  windowMargin?: number;
  borderOffset?: number;
  offsetTop?: number;
  offsetLeft?: number;
  canvasRelative?: boolean;
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
type OnDropHandler<NodeType> = (
  targetNode: NodeType | undefined,
  sourceNodes: NodeType[],
  index: number | undefined,
) => void;
type OnTargetChangeHandler<NodeType> = (
  oldTargetNode: NodeType | undefined,
  newTargetNode: NodeType | undefined,
) => void;
type OnPlaceholderPositionChangeHandler = (targetDimension: Dimension, placement: Placement) => void;
type OnEndHandler = () => void;

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
  onEnd?: OnEndHandler;

  // For compatibility with old sorter
  legacyOnMoveClb?: Function;
  legacyOnStartSort?: Function;
  legacyOnEndMove?: Function;
  legacyOnEnd?: Function;
}

export interface SorterDragBehaviorOptions {
  dragDirection: DragDirection;
  nested?: boolean;
  selectOnEnd?: boolean;
}

export interface SorterOptions<T, NodeType extends SortableTreeNode<T>> {
  em: EditorModel;
  treeClass: new (model: T, dragSource?: any) => NodeType;

  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers: SorterEventHandlers<NodeType>;
}
