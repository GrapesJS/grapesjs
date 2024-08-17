import { isString, isObject, bindAll } from 'underscore';
import BlockManager from '..';
import { View } from '../../common';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import Block from '../model/Block';
import Categories from '../../abstract/ModuleCategories';
import BlockView from './BlockView';
import CategoryView from '../../abstract/ModuleCategoryView';

export interface BlocksViewConfig {
  em: EditorModel;
  pStylePrefix?: string;
  ignoreCategories?: boolean;
  getSorter?: any;
}

export default class BlocksView extends View {
  em: EditorModel;
  config: BlocksViewConfig;
  categories: Categories;
  renderedCategories = new Map<string, CategoryView>();
  ppfx: string;
  noCatClass: string;
  blockContClass: string;
  catsClass: string;
  catsEl?: HTMLElement;
  blocksEl?: HTMLElement;
  rendered?: boolean;
  sorter: any;

  constructor(opts: any, config: BlocksViewConfig) {
    super(opts);
    bindAll(this, 'getSorter', 'onDrag', 'onDrop', 'onMove');
    this.config = config || {};
    this.categories = opts.categories || '';
    const ppfx = this.config.pStylePrefix || '';
    this.ppfx = ppfx;
    this.noCatClass = `${ppfx}blocks-no-cat`;
    this.blockContClass = `${ppfx}blocks-c`;
    this.catsClass = `${ppfx}block-categories`;
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
    this.em = this.config.em;

    if (this.em) {
      this.config.getSorter = this.getSorter;
    }
  }

  __getModule(): BlockManager {
    return this.em.Blocks;
  }

  updateConfig(opts = {}) {
    this.config = {
      ...this.config,
      ...opts,
    };
  }

  /**
   * Get sorter
   * @private
   */
  getSorter() {
    const { em } = this;
    if (!em) return;

    if (!this.sorter) {
      const utils = em.Utils;
      const canvas = em.Canvas;

      this.sorter = new utils.Sorter({
        // @ts-ignore
        container: canvas.getBody(),
        placer: canvas.getPlacerEl(),
        containerSel: '*',
        itemSel: '*',
        pfx: this.ppfx,
        onStart: this.onDrag,
        onEndMove: this.onDrop,
        onMove: this.onMove,
        document: canvas.getFrameEl().contentDocument,
        direction: 'a',
        wmargin: 1,
        nested: 1,
        em,
        canvasRelative: 1,
      });
    }

    return this.sorter;
  }

  onDrag(ev: Event) {
    this.em.stopDefault();
    this.__getModule().__startDrag(this.sorter.__currentBlock, ev);
  }

  onMove(ev: Event) {
    this.__getModule().__drag(ev);
  }

  onDrop(component?: Component) {
    this.em.runDefault();
    this.__getModule().__endDrag({ component });
    delete this.sorter.__currentBlock;
  }

  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   * */
  addTo(model: Block) {
    this.add(model);
  }

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model: Block, fragment?: DocumentFragment) {
    const { config, renderedCategories } = this;
    const attributes = model.get('attributes');
    const view = new BlockView({ model, attributes }, config);
    const rendered = view.render().el;
    const category = model.parent.initCategory(model);

    // Check for categories
    if (category && this.categories && !config.ignoreCategories) {
      const catId = category.getId();
      const categories = this.getCategoriesEl();
      let catView = renderedCategories.get(catId);

      if (!catView && categories) {
        catView = new CategoryView({ model: category }, config, 'block').render();
        renderedCategories.set(catId, catView);
        categories.appendChild(catView.el);
      }

      catView?.append(rendered);
      return;
    }

    fragment ? fragment.appendChild(rendered) : this.append(rendered);
  }

  getCategoriesEl() {
    if (!this.catsEl) {
      this.catsEl = this.el.querySelector(`.${this.catsClass}`)!;
    }

    return this.catsEl;
  }

  getBlocksEl() {
    if (!this.blocksEl) {
      this.blocksEl = this.el.querySelector(`.${this.noCatClass} .${this.blockContClass}`)!;
    }

    return this.blocksEl;
  }

  append(el: HTMLElement | DocumentFragment) {
    let blocks = this.getBlocksEl();
    blocks && blocks.appendChild(el);
  }

  render() {
    const ppfx = this.ppfx;
    const frag = document.createDocumentFragment();
    delete this.catsEl;
    delete this.blocksEl;
    this.renderedCategories = new Map();
    this.el.innerHTML = `
      <div class="${this.catsClass}"></div>
      <div class="${this.noCatClass}">
        <div class="${this.blockContClass}"></div>
      </div>
    `;

    this.collection.each((model) => this.add(model, frag));
    this.append(frag);
    const cls = `${this.blockContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    this.$el.addClass(cls);
    this.rendered = true;
    return this;
  }
}
