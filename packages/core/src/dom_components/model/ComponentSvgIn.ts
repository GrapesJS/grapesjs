import ComponentSvg from './ComponentSvg';

/**
 * Component for inner SVG elements
 */
export default class ComponentSvgIn extends ComponentSvg {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      selectable: false,
      hoverable: false,
      layerable: false,
    };
  }

  static isComponent(el: any, opts: any = {}) {
    return !!opts.inSvg;
  }
}
