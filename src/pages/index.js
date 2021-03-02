import { isString } from 'underscore';
import { createId } from 'utils/mixins';
import Pages from './model/Pages';
import Page from './model/Page';

export const evPfx = 'page:';
export const evPageSelect = `${evPfx}select`;
const typeMain = 'main';

export default () => {
  return {
    name: 'PageManager',

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
      const pages = new Pages(defPages, cnf);
      this.pages = pages;
      const mainPage = !pages.length
        ? this.add({ type: typeMain })
        : this.getMain();
      this.em = em;
      this.select(mainPage, { silent: 1, main: 1 });
      pages.on('add', (p, c, o) => em.trigger(`${evPfx}add`, p, o));
      pages.on('remove', (p, c, o) => em.trigger(`${evPfx}remove`, p, o));

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
      const page = this.pages.add(props, opts);
      opts.select && this.select(page);
      return page;
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
     * Get main page
     * @returns {Page}
     */
    getMain() {
      const pages = this.getAll();
      return pages.filter(p => p.get('type') === typeMain)[0] || pages.at(0);
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
    select(pg, opts = {}) {
      const { em, selected } = this;
      const page = isString(pg) ? this.get(pg) : pg;
      this.selected = page;
      const um = em.get('UndoManager');
      um && um.select(page.id, { ...opts, create: 1 });
      !opts.silent && em.trigger(evPageSelect, page, selected);
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
