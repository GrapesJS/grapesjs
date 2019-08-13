import Component from './ComponentText';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      type: 'link',
      tagName: 'a',
      traits: ['title', 'href', 'target']
    },

    /**
     * Returns object of attributes for HTML
     * @return {Object}
     * @private
     */
    getAttrToHTML(...args) {
      const attr = Component.prototype.getAttrToHTML.apply(this, args);
      delete attr.onmousedown;
      return attr;
    }
  },
  {
    isComponent(el) {
      let result;
      let avoidEdit;

      if (el.tagName == 'A') {
        result = {
          type: 'link',
          editable: 0
        };

        // The link is editable only if, at least, one of its
        // children is a text node (not empty one)
        const children = el.childNodes;
        const len = children.length;
        if (!len) delete result.editable;

        for (let i = 0; i < len; i++) {
          const child = children[i];

          if (child.nodeType == 3 && child.textContent.trim() != '') {
            delete result.editable;
            break;
          }
        }
      }

      return result;
    }
  }
);
