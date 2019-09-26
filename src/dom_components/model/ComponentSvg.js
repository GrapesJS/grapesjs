import Component from './Component';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      highlightable: 0
    },

    getName() {
      let name = this.get('tagName');
      let customName = this.get('custom-name');
      name = name.charAt(0).toUpperCase() + name.slice(1);
      return customName || name;
    }
  },
  {
    isComponent(el) {
      if (SVGElement && el instanceof SVGElement) {
        // Some SVG elements require uppercase letters (eg. <linearGradient>)
        const tagName = el.tagName;
        // Make the root resizable
        const resizable = tagName == 'svg' ? true : false;

        return {
          tagName,
          type: 'svg',
          resizable
        };
      }
    }
  }
);
