import { Model } from '../../common';
import { isFunction } from 'underscore';
import EditorModule from '../../editor';
import { BlockCategoryProperties } from './Category';

/** @private */
export interface BlockProperties {
  /**
   * Block label, eg. `My block`
   */
  label: string;
  /**
   * The content of the block. Might be an HTML string or a [Component Defintion](/modules/Components.html#component-definition)
   */
  content: string | any;
  /**
   * HTML string for the media/icon of the block, eg. `<svg ...`, `<img ...`, etc.
   * @default ''
   */
  media?: string;
  /**
   * Block category, eg. `Basic blocks`
   * @default ''
   */
  category?: string | BlockCategoryProperties;
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
  onClick?: (block: Block, editor: EditorModule) => void;
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
    };
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
   * Get block category label
   * @returns {String}
   */
  getCategoryLabel(): string {
    const ctg = this.get('category');
    // @ts-ignore
    return isFunction(ctg?.get) ? ctg.get('label') : ctg?.label ? ctg?.label : ctg;
  }
}
