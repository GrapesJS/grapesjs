import ComponentSvg from './ComponentSvg';

/**
 * Component for inner SVG elements
 */
export default class ComponentSvgln extends ComponentSvg {
  get defaults() {
    return {
      ...super.defaults,
      selectable: false,
      hoverable: false,
      layerable: false,
    };
  }
}

ComponentSvgln.isComponent = (el, opts = {}) => !!opts.inSvg;
