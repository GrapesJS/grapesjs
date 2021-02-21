import { isString } from 'underscore';
import { createId } from 'utils/mixins';
import Pages from './model/Pages';
import Page from './model/Page';

export const evPfx = `page:`;

export default () => {
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
      const cnf = { ...opts };
      this.config = cnf;
      const defPages = cnf.pages || [];
      const pages = new Pages(defPages);
      this.pages = pages;
      const mainPage = !pages.length ? this.add({ type: 'main' }) : pages.at(0);
      this.select(mainPage);
      pages.on('add', (p, c, o) => em.trigger(`${evPfx}add`, p, o));
      pages.on('remove', (p, c, o) => em.trigger(`${evPfx}remove`, p, o));
      this.em = em;

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

    getAllMap() {
      return this.getAll().reduce((acc, i) => {
        acc[i.get('id')] = i;
        return acc;
      }, {});
    },

    /**
     * Select page
     * @param {String|Page} page Page or page id
     * @returns {this}
     */
    select(pg) {
      const { em } = this;
      const page = isString(pg) ? this.get(pg) : pg;
      this.selected = page;
      em && em.trigger(`${evPfx}:select`, page);
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

    _createId() {
      const pages = this.getAll();
      const len = pages.length + 16;
      const pagesMap = this.getAllMap();
      let id;

      do {
        id = createId(len);
      } while (pagesMap[id]);

      return id;
    }
  };
};
