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

export interface SorterEventHandlers<T> {
  onStartSort?: (sourceNode: SortableTreeNode<T>, container?: HTMLElement) => void;
  onDragStart?: (mouseEvent: MouseEvent) => void;
  onMouseMove?: Function;
  onDrop?: (targetNode: SortableTreeNode<T>, sourceNode: SortableTreeNode<T>, index: number) => void;
  onTargetChange?: (oldTargetNode: SortableTreeNode<T>, newTargetNode: SortableTreeNode<T>) => void;
  onPlaceholderPositionChange?: (dims: Dimension[], newPosition: Position) => void;
  onEndMove?: Function;
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

