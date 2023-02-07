import Frame from '../../canvas/model/Frame';
import EditorModel from '../../editor/model/Editor';
import Selectors from '../../selector_manager/model/Selectors';
import { TraitProperties } from '../../trait_manager/model/Trait';
import Traits from '../../trait_manager/model/Traits';
import { ResizerOptions } from '../../utils/Resizer';
import { DomComponentsConfig } from '../config/config';
import Component from './Component';
import Components from './Components';
import { ToolbarButtonProps } from './ToolbarButton';

export type DragMode = 'translate' | 'absolute';

export interface ComponentProperties {
  /**
   * Component type, eg. `text`, `image`, `video`, etc.
   * @defaultValue ''
   */
  type?: string;
  /**
   * HTML tag of the component, eg. `span`. Default: `div`
   * @defaultValue 'div'
   */
  tagName?: string;
  /**
   * Key-value object of the component's attributes, eg. `{ title: 'Hello' }` Default: `{}`
   * @defaultValue {}
   */
  attributes?: Record<string, any>;
  /**
   * Name of the component. Will be used, for example, in Layers and badges
   * @defaultValue ''
   */
  name?: string;
  /**
   * When `true` the component is removable from the canvas, default: `true`
   * @defaultValue true
   */
  removable?: boolean;
  /**
       * Indicates if it's possible to drag the component inside others.
       You can also specify a query string to indentify elements,
       eg. `'.some-class[title=Hello], [data-gjs-type=column]'` means you can drag the component only inside elements
       containing `some-class` class and `Hello` title, and `column` components. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drag is possible. Default: `true`
       * @defaultValue true
       */
  draggable?: boolean | string | ((...params: any[]) => any);
  /**
       * Indicates if it's possible to drop other components inside. You can use
      a query string as with `draggable`. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drop is possible. Default: `true`
       * @defaultValue true
       */
  droppable?: boolean | string | ((...params: any[]) => any);
  /**
   * Set to false if you don't want to see the badge (with the name) over the component. Default: `true`
   * @defaultValue true
   */
  badgable?: boolean;
  /**
       * True if it's possible to style the component.
      You can also indicate an array of CSS properties which is possible to style, eg. `['color', 'width']`, all other properties
      will be hidden from the style manager. Default: `true`
       * @defaultValue true
       */
  stylable?: boolean | String[];
  ///**
  // * Indicate an array of style properties to show up which has been marked as `toRequire`. Default: `[]`
  // * @defaultValue []
  // */
  //`stylable-require`?: String[];
  /**
   * Indicate an array of style properties which should be hidden from the style manager. Default: `[]`
   * @defaultValue []
   */
  unstylable?: String[];
  /**
   * It can be highlighted with 'dotted' borders if true. Default: `true`
   * @defaultValue true
   */
  highlightable?: boolean;
  /**
   * True if it's possible to clone the component. Default: `true`
   * @defaultValue true
   */
  copyable?: boolean;
  /**
   * Indicates if it's possible to resize the component. It's also possible to pass an object as [options for the Resizer](https://github.com/GrapesJS/grapesjs/blob/master/src/utils/Resizer.js). Default: `false`
   */
  resizable?: boolean | ResizerOptions;
  /**
   * Allow to edit the content of the component (used on Text components). Default: `false`
   */
  editable?: boolean;
  /**
   * Set to `false` if you need to hide the component inside Layers. Default: `true`
   * @defaultValue true
   */
  layerable?: boolean;
  /**
   * Allow component to be selected when clicked. Default: `true`
   * @defaultValue true
   */
  selectable?: boolean;
  /**
   * Shows a highlight outline when hovering on the element if `true`. Default: `true`
   * @defaultValue true
   */
  hoverable?: boolean;
  /**
   * This property is used by the HTML exporter as void elements don't have closing tags, eg. `<br/>`, `<hr/>`, etc. Default: `false`
   */
  void?: boolean;
  /**
   * Component default style, eg. `{ width: '100px', height: '100px', 'background-color': 'red' }`
   * @defaultValue {}
   */
  style?: any;
  /**
   * Component related styles, eg. `.my-component-class { color: red }`
   * @defaultValue ''
   */
  styles?: string;
  /**
   * Content of the component (not escaped) which will be appended before children rendering. Default: `''`
   * @defaultValue ''
   */
  content?: string;
  /**
   * Component's icon, this string will be inserted before the name (in Layers and badge), eg. it can be an HTML string '<i class="fa fa-square-o"></i>'. Default: `''`
   * @defaultValue ''
   */
  icon?: string;
  /**
   * Component's javascript. More about it [here](/modules/Components-js.html). Default: `''`
   * @defaultValue ''
   */
  script?: string | ((...params: any[]) => any);
  ///**
  // * You can specify javascript available only in export functions (eg. when you get the HTML).
  //If this property is defined it will overwrite the `script` one (in export functions). Default: `''`
  // * @defaultValue ''
  // */
  //script-export?: string | ((...params: any[]) => any);
  /**
   * Component's traits. More about it [here](/modules/Traits.html). Default: `['id', 'title']`
   * @defaultValue ''
   */
  traits?: Traits;
  /**
       * Indicates an array of properties which will be inhereted by all NEW appended children.
       For example if you create a component likes this: `{ removable: false, draggable: false, propagate: ['removable', 'draggable'] }`
       and append some new component inside, the new added component will get the exact same properties indicated in the `propagate` array (and the `propagate` property itself). Default: `[]`
       * @defaultValue []
       */
  propagate?: (keyof ComponentProperties)[];

  /**
   * Set an array of items to show up inside the toolbar when the component is selected (move, clone, delete).
   * Eg. `toolbar: [ { attributes: {class: 'fa fa-arrows'}, command: 'tlb-move' }, ... ]`.
   * By default, when `toolbar` property is falsy the editor will add automatically commands `core:component-exit` (select parent component, added if there is one), `tlb-move` (added if `draggable`) , `tlb-clone` (added if `copyable`), `tlb-delete` (added if `removable`).
   */
  toolbar?: ToolbarButtonProps[];
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
