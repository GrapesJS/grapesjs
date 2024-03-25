/**
 * You can customize the initial state of the module from the editor initialization
 * ```js
 * const editor = grapesjs.init({
 *  ....
 *  pageManager: {
 *    pages: [
 *      {
 *        id: 'page-id',
 *        styles: `.my-class { color: red }`, // or a JSON of styles
 *        component: '<div class="my-class">My element</div>', // or a JSON of components
 *      }
 *   ]
 *  },
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const pageManager = editor.Pages;
 * ```
 *
 * {REPLACE_EVENTS}
 *
 * [Page]: page.html
 * [Component]: component.html
 *
 * @module Pages
 */

import { isString, bindAll, unique, flatten } from 'underscore';
import { createId } from '../utils/mixins';
import { ModuleModel } from '../abstract';
import { ItemManagerModule } from '../abstract/Module';
import Pages from './model/Pages';
import Page, { PageProperties } from './model/Page';
import EditorModel from '../editor/model/Editor';
import ComponentWrapper from '../dom_components/model/ComponentWrapper';
import { AddOptions, RemoveOptions, SetOptions } from '../common';
import PagesEvents, { AbortOption, PageManagerConfig, SelectableOption } from './types';

const chnSel = 'change:selected';
const typeMain = 'main';

export default class PageManager extends ItemManagerModule<PageManagerConfig, Pages> {
  events = PagesEvents;
  storageKey = 'pages';

  get pages() {
    return this.all;
  }

  model: ModuleModel;

  getAll() {
    // this avoids issues during the TS build (some getAll are inconsistent)
    return [...this.all.models];
  }

  /**
   * Get all pages
   * @name getAll
   * @function
   * @returns {Array<[Page]>}
   * @example
   * const arrayOfPages = pageManager.getAll();
   */

  /**
   * Initialize module
   * @hideconstructor
   * @param {Object} config Configurations
   */
  constructor(em: EditorModel) {
    super(em, 'PageManager', new Pages([], em), PagesEvents);
    bindAll(this, '_onPageChange');
    const model = new ModuleModel({ _undo: true } as any);
    this.model = model;
    this.pages.on('reset', coll => coll.at(0) && this.select(coll.at(0)));
    this.pages.on('all', this.__onChange, this);
    model.on(chnSel, this._onPageChange);
  }

  __onChange(event: string, page: Page, coll: Pages, opts?: any) {
    const { em, events } = this;
    const options = opts || coll;
    em.trigger(events.all, { event, page, options });
  }

  onLoad() {
    const { pages, config, em } = this;
    const opt = { silent: true };
    const configPages = config.pages?.map(page => new Page(page, { em, config })) || [];
    pages.add(configPages, opt);
    const mainPage = !pages.length ? this.add({ type: typeMain }, opt) : this._initPage();
    mainPage && this.select(mainPage, opt);
  }

  _onPageChange(m: any, page: Page, opts: any) {
    const { em, events } = this;
    const lm = em.Layers;
    const mainComp = page.getMainComponent();
    lm && mainComp && lm.setRoot(mainComp as any);
    em.trigger(events.select, page, m.previous('selected'));
    this.__onChange(chnSel, page, opts);
  }

  postLoad() {
    const { em, model, pages } = this;
    const um = em.UndoManager;
    um.add(model);
    um.add(pages);
    pages.on('add remove reset change', (m, c, o) => em.changesUp(o || c));
  }

  /**
   * Add new page
   * @param {Object} props Page properties
   * @param {Object} [opts] Options
   * @returns {[Page]}
   * @example
   * const newPage = pageManager.add({
   *  id: 'new-page-id', // without an explicit ID, a random one will be created
   *  styles: `.my-class { color: red }`, // or a JSON of styles
   *  component: '<div class="my-class">My element</div>', // or a JSON of components
   * });
   */
  add(props: PageProperties, opts: AddOptions & SelectableOption & AbortOption = {}) {
    const { em, events } = this;
    props.id = props.id || this._createId();
    const add = () => {
      const page = this.pages.add(new Page(props, { em: this.em, config: this.config }), opts);
      opts.select && this.select(page);
      return page;
    };
    !opts.silent && em.trigger(events.addBefore, props, add, opts);
    return !opts.abort ? add() : undefined;
  }

  /**
   * Remove page
   * @param {String|[Page]} page Page or page id
   * @returns {[Page]} Removed Page
   * @example
   * const removedPage = pageManager.remove('page-id');
   * // or by passing the page
   * const somePage = pageManager.get('page-id');
   * pageManager.remove(somePage);
   */
  remove(page: string | Page, opts: RemoveOptions & AbortOption = {}) {
    const { em, events } = this;
    const pg = isString(page) ? this.get(page) : page;
    const rm = () => {
      pg && this.pages.remove(pg, opts);
      return pg;
    };
    !opts.silent && em.trigger(events.removeBefore, pg, rm, opts);
    return !opts.abort && rm();
  }

  /**
   * Get page by id
   * @param {String} id Page id
   * @returns {[Page]}
   * @example
   * const somePage = pageManager.get('page-id');
   */
  get(id: string): Page | undefined {
    return this.pages.filter(p => p.get(p.idAttribute) === id)[0];
  }

  /**
   * Get main page (the first one available)
   * @returns {[Page]}
   * @example
   * const mainPage = pageManager.getMain();
   */
  getMain() {
    const { pages } = this;
    return pages.filter(p => p.get('type') === typeMain)[0] || pages.at(0);
  }

  /**
   * Get wrapper components (aka body) from all pages and frames.
   * @returns {Array<[Component]>}
   * @example
   * const wrappers = pageManager.getAllWrappers();
   * // Get all `image` components from the project
   * const allImages = wrappers.map(wrp => wrp.findType('image')).flat();
   */
  getAllWrappers(): ComponentWrapper[] {
    const pages = this.getAll();
    return unique(flatten(pages.map(page => page.getAllFrames().map(frame => frame.getComponent()))));
  }

  /**
   * Change the selected page. This will switch the page rendered in canvas
   * @param {String|[Page]} page Page or page id
   * @returns {this}
   * @example
   * pageManager.select('page-id');
   * // or by passing the page
   * const somePage = pageManager.get('page-id');
   * pageManager.select(somePage);
   */
  select(page: string | Page, opts: SetOptions = {}) {
    const { em, model, events } = this;
    const pg = isString(page) ? this.get(page) : page;
    if (pg) {
      em.trigger(events.selectBefore, pg, opts);
      model.set('selected', pg, opts);
    }
    return this;
  }

  /**
   * Get the selected page
   * @returns {[Page]}
   * @example
   * const selectedPage = pageManager.getSelected();
   */
  getSelected(): Page | undefined {
    return this.model.get('selected');
  }

  destroy() {
    this.pages.off().reset();
    this.model.stopListening();
    this.model.clear({ silent: true });
    //@ts-ignore
    ['selected', 'model'].map(i => (this[i] = 0));
  }

  store() {
    return this.getProjectData();
  }

  load(data: any) {
    const result = this.loadProjectData(data, { all: this.pages, reset: true });
    this.pages.forEach(page => page.getFrames().initRefs());
    return result;
  }

  _initPage() {
    return this.get(this.config.selected!) || this.getMain();
  }

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
}
