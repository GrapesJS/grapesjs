import Component from './ComponentSvg';

/**
 * Component for inner SVG elements
 */
export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      selectable: false,
      hoverable: false,
      layerable: false
    }
  },
  {
    isComponent: (el, opts = {}) => !!opts.inSvg
  }
);
