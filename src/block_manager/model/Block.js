import { Model } from '../../common';
import { isFunction } from 'underscore';

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
export default class Block extends Model {
  defaults() {
    return {
      label: '',
      content: '',
      media: '',
      category: '',
      activate: false,
      select: null,
      resetId: false,
      disable: false,
      onClick: null,
      attributes: {},
    };
  }

  /**
   * Get block id
   * @returns {String}
   */
  getId() {
    return this.id;
  }

  /**
   * Get block label
   * @returns {String}
   */
  getLabel() {
    return this.get('label');
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
  getCategoryLabel() {
    const ctg = this.get('category');
    return isFunction(ctg.get) ? ctg.get('label') : ctg.label ? ctg.label : ctg;
  }
}
