import Frame from '../../canvas/model/Frame';
import { Nullable } from '../../common';
import EditorModel from '../../editor/model/Editor';
import Selectors from '../../selector_manager/model/Selectors';
import { TraitProperties } from '../../trait_manager/types';
import Traits from '../../trait_manager/model/Traits';
import { ResizerOptions } from '../../utils/Resizer';
import { DomComponentsConfig } from '../config/config';
import ComponentView from '../view/ComponentView';
import Component from './Component';
import Components from './Components';
import { ToolbarButtonProps } from './ToolbarButton';

export type DragMode = 'translate' | 'absolute' | '';

export type DraggableDroppableFn = (source: Component, target: Component, index?: number) => boolean | void;

export interface ComponentStackItem {
  id: string;
  model: typeof Component;
  view: typeof ComponentView<any>;
}

/**
 * Delegate commands to other components.
 */
export interface ComponentDelegateProps {
  /**
   * Delegate remove command to another component.
   * @example
   * delegate: {
   *  remove: (cmp) => cmp.closestType('other-type'),
   * }
   */
  remove?: (cmp: Component) => Component | Nullable;
  /**
   * Delegate move command to another component.
   * @example
   * delegate: {
   *  move: (cmp) => cmp.closestType('other-type'),
   * }
   */
  move?: (cmp: Component) => Component | Nullable;
  /**
   * Delegate copy command to another component.
   * @example
   * delegate: {
   *  copy: (cmp) => cmp.closestType('other-type'),
   * }
   */
  copy?: (cmp: Component) => Component | Nullable;
  /**
   * Delegate select command to another component.
   * @example
   * delegate: {
   *  select: (cmp) => cmp.findType('other-type')[0],
   * }
   */
  select?: (cmp: Component) => Component | Nullable;
}

export interface ComponentProperties {
  /**
   * Component type, eg. `text`, `image`, `video`, etc.
   * @default ''
   */
  type?: string;
  /**
   * HTML tag of the component, eg. `span`. Default: `div`
   * @default 'div'
   */
  tagName?: string;
  /**
   * Key-value object of the component's attributes, eg. `{ title: 'Hello' }` Default: `{}`
   * @default {}
   */
  attributes?: Record<string, any>;
  /**
   * Name of the component. Will be used, for example, in Layers and badges
   * @default ''
   */
  name?: string;
  /**
   * When `true` the component is removable from the canvas, default: `true`
   * @default true
   */
  removable?: boolean;
  /**
       * Indicates if it's possible to drag the component inside others.
       You can also specify a query string to indentify elements,
       eg. `'.some-class[title=Hello], [data-gjs-type=column]'` means you can drag the component only inside elements
       containing `some-class` class and `Hello` title, and `column` components. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drag is possible. Default: `true`
       * @default true
       */
  draggable?: boolean | string | DraggableDroppableFn;
  /**
       * Indicates if it's possible to drop other components inside. You can use
      a query string as with `draggable`. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drop is possible. Default: `true`
       * @default true
       */
  droppable?: boolean | string | DraggableDroppableFn;
  /**
   * Set to false if you don't want to see the badge (with the name) over the component. Default: `true`
   * @default true
   */
  badgable?: boolean;
  /**
       * True if it's possible to style the component.
      You can also indicate an array of CSS properties which is possible to style, eg. `['color', 'width']`, all other properties
      will be hidden from the style manager. Default: `true`
       * @default true
       */
  stylable?: boolean | String[];
  ///**
  // * Indicate an array of style properties to show up which has been marked as `toRequire`. Default: `[]`
  // * @default []
  // */
  //`stylable-require`?: String[];
  /**
   * Indicate an array of style properties which should be hidden from the style manager. Default: `[]`
   * @default []
   */
  unstylable?: String[];
  /**
   * It can be highlighted with 'dotted' borders if true. Default: `true`
   * @default true
   */
  highlightable?: boolean;
  /**
   * True if it's possible to clone the component. Default: `true`
   * @default true
   */
  copyable?: boolean;
  /**
   * Indicates if it's possible to resize the component. It's also possible to pass an object as [options for the Resizer](https://github.com/GrapesJS/grapesjs/blob/master/src/utils/Resizer.ts). Default: `false`
   */
  resizable?: boolean | ResizerOptions;
  /**
   * Allow to edit the content of the component (used on Text components). Default: `false`
   */
  editable?: boolean;
  /**
   * Set to `false` if you need to hide the component inside Layers. Default: `true`
   * @default true
   */
  layerable?: boolean;
  /**
   * Allow component to be selected when clicked. Default: `true`
   * @default true
   */
  selectable?: boolean;
  /**
   * Shows a highlight outline when hovering on the element if `true`. Default: `true`
   * @default true
   */
  hoverable?: boolean;
  /**
   * Disable the selection of the component and its children in the canvas.
   * @default false
   */
  locked?: boolean;
  /**
   * This property is used by the HTML exporter as void elements don't have closing tags, eg. `<br/>`, `<hr/>`, etc. Default: `false`
   */
  void?: boolean;
  /**
   * Component default style, eg. `{ width: '100px', height: '100px', 'background-color': 'red' }`
   * @default {}
   */
  style?: any;
  /**
   * Component related styles, eg. `.my-component-class { color: red }`
   * @default ''
   */
  styles?: string;
  /**
   * Content of the component (not escaped) which will be appended before children rendering. Default: `''`
   * @default ''
   */
  content?: string;
  /**
   * Component's icon, this string will be inserted before the name (in Layers and badge), eg. it can be an HTML string '<i class="fa fa-square-o"></i>'. Default: `''`
   * @default ''
   */
  icon?: string;
  /**
   * Component's javascript. More about it [here](/modules/Components-js.html). Default: `''`
   * @default ''
   */
  script?: string | ((...params: any[]) => any);
  ///**
  // * You can specify javascript available only in export functions (eg. when you get the HTML).
  //If this property is defined it will overwrite the `script` one (in export functions). Default: `''`
  // * @default ''
  // */
  //script-export?: string | ((...params: any[]) => any);
  /**
   * Component's traits. More about it [here](/modules/Traits.html). Default: `['id', 'title']`
   * @default ''
   */
  traits?: Traits;
  /**
       * Indicates an array of properties which will be inhereted by all NEW appended children.
       For example if you create a component likes this: `{ removable: false, draggable: false, propagate: ['removable', 'draggable'] }`
       and append some new component inside, the new added component will get the exact same properties indicated in the `propagate` array (and the `propagate` property itself). Default: `[]`
       * @default []
       */
  propagate?: (keyof ComponentProperties)[];

  /**
   * Set an array of items to show up inside the toolbar when the component is selected (move, clone, delete).
   * Eg. `toolbar: [ { attributes: {class: 'fa fa-arrows'}, command: 'tlb-move' }, ... ]`.
   * By default, when `toolbar` property is falsy the editor will add automatically commands `core:component-exit` (select parent component, added if there is one), `tlb-move` (added if `draggable`) , `tlb-clone` (added if `copyable`), `tlb-delete` (added if `removable`).
   */
  toolbar?: ToolbarButtonProps[];

  /**
   * Delegate commands to other components.
   */
  delegate?: ComponentDelegateProps;

  ///**
  // * Children components. Default: `null`
  // */
  components?: Components;

  classes?: Selectors;
  dmode?: DragMode;
  'script-props'?: string[];
  [key: string]: any;
}

export interface SymbolToUpOptions {
  changed?: string;
  fromInstance?: boolean;
  noPropagate?: boolean;
  fromUndo?: boolean;
}

export interface ComponentDefinition extends Omit<ComponentProperties, 'components' | 'traits'> {
  /**
   * Children components.
   */
  components?: string | ComponentDefinition | (string | ComponentDefinition)[];
  traits?: (Partial<TraitProperties> | string)[];
  attributes?: Record<string, any>;
  [key: string]: unknown;
}

export interface ComponentDefinitionDefined extends Omit<ComponentProperties, 'components' | 'traits'> {
  /**
   * Children components.
   */
  components?: ComponentDefinitionDefined[] | ComponentDefinitionDefined;
  traits?: (Partial<TraitProperties> | string)[];
  [key: string]: any;
}

export interface ComponentModelProperties extends ComponentProperties {
  [key: string]: any;
}

type ComponentAddType = Component | ComponentDefinition | ComponentDefinitionDefined | string;

export type ComponentAdd = ComponentAddType | ComponentAddType[];

export type ToHTMLOptions = {
  /**
   * Custom tagName.
   */
  tag?: string;

  /**
   * Include component properties as `data-gjs-*` attributes. This allows you to have re-importable HTML.
   */
  withProps?: boolean;

  /**
   * In case the attribute value contains a `"` char, instead of escaping it (`attr="value &quot;"`), the attribute will be quoted using single quotes (`attr='value "'`).
   */
  altQuoteAttr?: boolean;

  /**
   * You can pass an object of custom attributes to replace with the current ones
   * or you can even pass a function to generate attributes dynamically.
   */
  attributes?: Record<string, any> | ((component: Component, attr: Record<string, any>) => Record<string, any>);
};

export interface ComponentOptions {
  em?: EditorModel;
  config?: DomComponentsConfig;
  frame?: Frame;
  temporary?: boolean;
  avoidChildren?: boolean;
}
