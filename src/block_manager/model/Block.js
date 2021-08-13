import { Model } from 'common';

/**
 * @property {String} [label=''] Block label, eg. `My block`
 * @property {Boolean} [activate=false] If true, triggers an the 'active' event on dropped component
 * @property {Boolean} [select=false] If true, the dropped component will be selected
 * @property {Boolean} [resetId=false] If true, all IDs of dropped components and their styles will be changed
 * @property {Boolean} [disable=false] Disable the drag of the block
 * @property {String} [media=''] HTML string for the media/icon of the block, eg. `<svg ...`, `<img ...`, etc.
 *  (**WARNING:** In order to support HTML strings, this property is not escaped)
 * @property {String|Object} content The content of the block. Might be an HTML string or a [Component Defintion](/modules/Components.html#component-definition)
 * @property {String} [category=''] Block category
 * @property {Object} [attributes={}] Block attributes to apply in the view element
 */
export default class Block extends Model {
  defaults() {
    return {
      label: '',
      activate: false,
      select: false,
      resetId: false,
      disable: false,
      media: '',
      content: '',
      category: '',
      attributes: {}
    };
  }
}
