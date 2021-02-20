import { isString } from 'underscore';
import Pages from './model/Pages';
import Page from './model/Page';

export default () => {
  const evPfx = `page:`;

  return {
    name: 'Pages',

    Page,

    Pages,

    /**
     * Initialize module
     * @param {Object} config Configurations
     * @private
     */
    init(opts = {}) {
      const { em } = opts;
      this.config = { ...opts };
      const pages = new Pages();
      pages.on('add', (p, c, o) => em.trigger(`${evPfx}add`, p, o));
      pages.on('remove', (p, c, o) => em.trigger(`${evPfx}remove`, p, o));
      this.em = em;
      this.pages = pages;

      return this;
    },

    /**
     * Add new page
     * @param {Object} props Page properties
     * @param {Object} [options] Options
     * @returns {Page}
     */
    add(props, opts = {}) {
      props.id = props.id || this._createId();
      return this.pages.add(props, opts);
    },

    /**
     * Remove page
     * @param {String|Page} page Page or page id
     * @returns {Page}
     */
    remove(pg) {
      const page = isString(pg) ? this.get(pg) : pg;
      page && this.pages.remove(page);
      return page;
    },

    /**
     * Get page by id
     * @param {String} id Page id
     * @returns {Page}
     */
    get(id) {
      return this.pages.filter(p => p.get('id') === id)[0];
    },

    /**
     * Get all pages
     */
    getAll() {
      return this.pages;
    },

    /**
     * Select page
     * @param {String|Page} page Page or page id
     * @returns {this}
     */
    select(pg) {
      const page = isString(pg) ? this.get(pg) : pg;
      this.selected = page;
      this.em.trigger(`${evPfx}:select`, page);
      return this;
    },

    /**
     * Get the selected page
     * @returns {Page}
     */
    getSelected() {
      return this.selected;
    },

    /**
     * Destroy all
     */
    destroy() {
      this.pages.off().reset();
      ['selected', 'config', 'em', 'pages'].map(i => (this[i] = 0));
    },

    // TODO
    _createId() {
      return Math.random();
    }
  };
};
