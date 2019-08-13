import { result } from 'underscore';
import Component from './Component';

const svgAttrs =
  'xmlns="http://www.w3.org/2000/svg" width="100" viewBox="0 0 24 24" style="fill: rgba(0,0,0,0.15); transform: scale(0.75)"';

export default Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      type: 'image',
      tagName: 'img',
      void: 1,
      droppable: 0,
      editable: 1,
      highlightable: 0,
      resizable: { ratioDefault: 1 },
      traits: ['alt'],

      src: `<svg ${svgAttrs}>
        <path d="M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5m16 1V5a2 2 0 0 0-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z"></path>
      </svg>`,

      // Fallback image in case the src can't be loaded
      // If you use SVG, xmlns="http://www.w3.org/2000/svg" is required
      fallback: `<svg ${svgAttrs}>
        <path d="M2.28 3L1 4.27l2 2V19c0 1.1.9 2 2 2h12.73l2 2L21 21.72 2.28 3m2.55 0L21 19.17V5a2 2 0 0 0-2-2H4.83M8.5 13.5l2.5 3 1-1.25L14.73 18H5l3.5-4.5z"></path>
      </svg>`,

      // File to load asynchronously once the model is rendered
      file: ''
    },

    initialize(o, opt) {
      Component.prototype.initialize.apply(this, arguments);
      var attr = this.get('attributes');
      if (attr.src) this.set('src', attr.src);
    },

    initToolbar(...args) {
      Component.prototype.initToolbar.apply(this, args);
      const em = this.em;

      if (em) {
        var cmd = em.get('Commands');
        var cmdName = 'image-editor';

        // Add Image Editor button only if the default command exists
        if (cmd.has(cmdName)) {
          let hasButtonBool = false;
          var tb = this.get('toolbar');

          for (let i = 0; i < tb.length; i++) {
            if (tb[i].command === 'image-editor') {
              hasButtonBool = true;
              break;
            }
          }

          if (!hasButtonBool) {
            tb.push({
              attributes: { class: 'fa fa-pencil' },
              command: cmdName
            });
            this.set('toolbar', tb);
          }
        }
      }
    },

    /**
     * Returns object of attributes for HTML
     * @return {Object}
     * @private
     */
    getAttrToHTML(...args) {
      const attr = Component.prototype.getAttrToHTML.apply(this, args);
      const src = this.get('src');
      if (src) attr.src = src;
      return attr;
    },

    getSrcResult(opt = {}) {
      const src = this.get(opt.fallback ? 'fallback' : 'src') || '';
      let result = src;

      if (src && src.substr(0, 4) === '<svg') {
        result = `data:image/svg+xml;base64,${window.btoa(src)}`;
      }

      return result;
    },

    isDefaultSrc() {
      return this.get('src') === result(this, 'defaults').src;
    },

    /**
     * Parse uri
     * @param  {string} uri
     * @return {object}
     * @private
     */
    parseUri(uri) {
      var el = document.createElement('a');
      el.href = uri;
      var query = {};
      var qrs = el.search.substring(1).split('&');
      for (var i = 0; i < qrs.length; i++) {
        var pair = qrs[i].split('=');
        var name = decodeURIComponent(pair[0]);
        if (name) query[name] = decodeURIComponent(pair[1]);
      }
      return {
        hostname: el.hostname,
        pathname: el.pathname,
        protocol: el.protocol,
        search: el.search,
        hash: el.hash,
        port: el.port,
        query
      };
    }
  },
  {
    /**
     * Detect if the passed element is a valid component.
     * In case the element is valid an object abstracted
     * from the element will be returned
     * @param {HTMLElement}
     * @return {Object}
     * @private
     */
    isComponent(el) {
      var result = '';
      if (el.tagName == 'IMG') {
        result = { type: 'image' };
      }
      return result;
    }
  }
);
