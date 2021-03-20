import { isString, bindAll } from 'underscore';
import { createId } from 'utils/mixins';
import { Model } from 'backbone';
import Pages from './model/Pages';
import Page from './model/Page';

export const evAll = 'page';
export const evPfx = `${evAll}:`;
export const evPageSelect = `${evPfx}select`;
export const evPageUpdate = `${evPfx}update`;
export const evPageAdd = `${evPfx}add`;
export const evPageAddBefore = `${evPageAdd}:before`;
export const evPageRemove = `${evPfx}remove`;
export const evPageRemoveBefore = `${evPageRemove}:before`;
const typeMain = 'main';

export default () => {
  return {
    name: 'PageManager',

    storageKey: 'pages',

    Page,

    Pages,

    events: {
      all: evAll,
      select: evPageSelect,
      update: evPageUpdate,
      add: evPageAdd,
      addBefore: evPageAddBefore,
      remove: evPageRemove,
      removeBefore: evPageRemoveBefore
    },

    /**
     * Initialize module
     * @param {Object} config Configurations
     * @private
     */
    init(opts = {}) {
      bindAll(this, '_onPageChange');
      const { em } = opts;
      const cnf = { ...opts };
      this.config = cnf;
      this.em = em;
      const pages = new Pages([], cnf);
      this.pages = pages;
      const model = new Model({ _undo: true });
      this.model = model;
      pages.on('add', (p, c, o) => em.trigger(evPageAdd, p, o));
      pages.on('remove', (p, c, o) => em.trigger(evPageRemove, p, o));
      pages.on('change', (p, c) => {
        em.trigger(evPageUpdate, p, p.changedAttributes(), c);
      });
      pages.on('reset', coll => coll.at(0) && this.select(coll.at(0)));
      pages.on('all', this.__onChange, this);
      model.on('change:selected', this._onPageChange);

      return this;
    },

    __onChange(event, page, coll, opts) {
      const options = opts || coll;
      this.em.trigger(evAll, { event, page, options });
    },

    onLoad() {
      const { pages } = this;
      const opt = { silent: true };
      pages.add(this.config.pages || [], opt);
      const mainPage = !pages.length
        ? this.add({ type: typeMain }, opt)
        : this.getMain();
      this.select(mainPage, opt);
    },

    _onPageChange(m, page) {
      const { em } = this;
      const lm = em.get('LayerManager');
      const mainComp = page.getMainComponent();
      lm && mainComp && lm.setRoot(mainComp);
      em.trigger(evPageSelect, page, m.previous('selected'));
    },

    postLoad() {
      const { em, model } = this;
      const um = em.get('UndoManager');
      um && um.add(model);
      um && um.add(this.pages);
    },

    /**
     * Add new page
     * @param {Object} props Page properties
     * @param {Object} [options] Options
     * @returns {Page}
     */
    add(props, opts = {}) {
      const { em } = this;
      props.id = props.id || this._createId();
      props.frames = props.frames || [{}];
      const add = () => {
        const page = this.pages.add(props, opts);
        opts.select && this.select(page);
        return page;
      };
      !opts.silent && em.trigger(evPageAddBefore, props, add, opts);
      return !opts.abort && add();
    },

    /**
     * Remove page
     * @param {String|Page} page Page or page id
     * @returns {Page}
     */
    remove(pg, opts = {}) {
      const { em } = this;
      const page = isString(pg) ? this.get(pg) : pg;
      const rm = () => {
        page && this.pages.remove(page, opts);
        return page;
      };
      !opts.silent && em.trigger(evPageRemoveBefore, page, rm, opts);
      return !opts.abort && rm();
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
      const { pages } = this;
      return pages.filter(p => p.get('type') === typeMain)[0] || pages.at(0);
    },

    /**
     * Get all pages
     * @returns {Array<Page>}
     */
    getAll() {
      return this.pages.models;
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
      const page = isString(pg) ? this.get(pg) : pg;
      page && this.model.set('selected', page, opts);
      return this;
    },

    /**
     * Get the selected page
     * @returns {Page}
     */
    getSelected() {
      return this.model.get('selected');
    },

    /**
     * Destroy all
     */
    destroy() {
      this.pages.off().reset();
      this.model.stopListening();
      this.model.clear({ silent: true });
      ['selected', 'config', 'em', 'pages', 'model'].map(i => (this[i] = 0));
    },

    store(noStore) {
      if (!this.em.get('hasPages')) return {};
      const obj = {};
      const cnf = this.config;
      obj[this.storageKey] = JSON.stringify(this.getAll());
      if (!noStore && cnf.stm) cnf.stm.store(obj);
      return obj;
    },

    load(data = {}) {
      const key = this.storageKey;
      let res = data[key] || [];

      if (typeof res == 'string') {
        try {
          res = JSON.parse(data[key]);
        } catch (err) {}
      }

      res && res.length && this.pages.reset(res);

      return res;
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
