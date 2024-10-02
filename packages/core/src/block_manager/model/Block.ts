import { Model } from '../../common';
import { isFunction } from 'underscore';
import Editor from '../../editor';
import Category, { CategoryProperties } from '../../abstract/ModuleCategory';
import { ComponentDefinition } from '../../dom_components/model/types';
import Blocks from './Blocks';

export type ContentType = string | Block | ComponentDefinition | (string | ComponentDefinition)[];

/** @private */
export interface BlockProperties {
  /**
   * Block label, eg. `My block`
   */
  label: string;
  /**
   * Determines if a block can be moved inside a given component when the content is a function.
   *
   * This property is used to specify the component definition that determines the validity of the drag operation.
   * @type {ComponentDefinition | undefined}
   */
  definition?: ComponentDefinition;
  /**
   * The content of the block. Might be an HTML string or a [Component Defintion](/modules/Components.html#component-definition)
   */
  content: ContentType | (() => ContentType);
  /**
   * HTML string for the media/icon of the block, eg. `<svg ...`, `<img ...`, etc.
   * @default ''
   */
  media?: string;
  /**
   * Block category, eg. `Basic blocks`
   * @default ''
   */
  category?: string | CategoryProperties;
  /**
   * If true, triggers the `active` event on the dropped component.
   * @default false
   */
  activate?: boolean;
  /**
   * If true, the dropped component will be selected.
   * @default false
   */
  select?: boolean;
  /**
   * If true, all IDs of dropped components and their styles will be changed.
   * @default false
   */
  resetId?: boolean;
  /**
   * Disable the block from being interacted.
   * @default false
   */
  disable?: boolean;
  /**
   * Custom behavior on click.
   * @example
   * onClick: (block, editor) => editor.getWrapper().append(block.get('content'))
   */
  onClick?: (block: Block, editor: Editor) => void;
  /**
   * Block attributes
   */
  attributes?: Record<string, any>;

  id?: string;

  /**
   * @deprecated
   */
  activeOnRender?: boolean;
}

/**
 * @property {String} label Block label, eg. `My block`
 * @property {String|Object} content The content of the block. Might be an HTML string or a [Component Defintion](/modules/Components.html#component-definition)
 * @property {String} [media=''] HTML string for the media/icon of the block, eg. `<svg ...`, `<img ...`, etc.
 * @property {String} [category=''] Block category, eg. `Basic blocks`
 * @property {Boolean} [activate=false] If true, triggers the `active` event on the dropped component.
 * @property {Boolean} [select=false] If true, the dropped component will be selected.
 * @property {Boolean} [resetId=false] If true, all IDs of dropped components and their styles will be changed.
 * @property {Boolean} [disable=false] Disable the block from being interacted
 * @property {Function} [onClick] Custom behavior on click, eg. `(block, editor) => editor.getWrapper().append(block.get('content'))`
 * @property {Object} [attributes={}] Block attributes to apply in the view element
 *
 * @module docsjs.Block
 */
export default class Block extends Model<BlockProperties> {
  defaults() {
    return {
      label: '',
      content: '',
      media: '',
      category: '',
      activate: false,
      select: undefined,
      resetId: false,
      disable: false,
      onClick: undefined,
      attributes: {},
      definition: {},
    };
  }

  get category(): Category | undefined {
    const cat = this.get('category');
    return cat instanceof Category ? cat : undefined;
  }

  get parent() {
    return this.collection as unknown as Blocks;
  }

  /**
   * Get block id
   * @returns {String}
   */
  getId() {
    return this.id as string;
  }

  /**
   * Get block label
   * @returns {String}
   */
  getLabel() {
    return this.get('label')!;
  }

  /**
   * Get block media
   * @returns {String}
   */
  getMedia() {
    return this.get('media');
  }

  /**
   * Get block content
   * @returns {Object|String|Array<Object|String>}
   */
  getContent() {
    return this.get('content');
  }

  /**
   * Get block component definition
   * @returns {ComponentDefinition}
   */
  getDefinition() {
    return this.get('definition');
  }

  /**
   * Get block category label
   * @returns {String}
   */
  getCategoryLabel(): string {
    const ctg = this.get('category');
    // @ts-ignore
    return isFunction(ctg?.get) ? ctg.get('label') : ctg?.label ? ctg?.label : ctg;
  }
}
