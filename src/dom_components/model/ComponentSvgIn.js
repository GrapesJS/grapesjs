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
    isComponent(el) {
      if (Component.isComponent(el) && el.tagName.toLowerCase() !== 'svg') {
        return {
          tagName: el.tagName,
          type: 'svg-in'
        };
      }
    }
  }
);
