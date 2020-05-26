import Component from './Component';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      resizable: { ratioDefault: 1 },
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
        return {
          tagName: el.tagName,
          type: 'svg'
        };
      }
    }
  }
);
