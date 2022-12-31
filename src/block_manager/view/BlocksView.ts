import { isString, isObject, bindAll } from 'underscore';
import { View } from '../../common';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import Block from '../model/Block';
import Categories from '../model/Categories';
import BlockView from './BlockView';
import CategoryView from './CategoryView';

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
  renderedCategories: Record<string, CategoryView>;
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
    this.renderedCategories = {};
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

  __getModule() {
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
      const utils = em.get('Utils');
      const canvas = em.get('Canvas');

      this.sorter = new utils.Sorter({
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
    this.em.trigger('block:drag:move', ev); // old event
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
    const { config } = this;
    const view = new BlockView(
      {
        model,
        attributes: model.get('attributes'),
      },
      config
    );
    const rendered = view.render().el;
    let category = model.get('category');

    // Check for categories
    if (category && this.categories && !config.ignoreCategories) {
      if (isString(category)) {
        category = { id: category, label: category };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      const catModel = this.categories.add(category);
      const catId = catModel.get('id')!;
      const categories = this.getCategoriesEl();
      let catView = this.renderedCategories[catId];
      // @ts-ignore
      model.set('category', catModel, { silent: true });

      if (!catView && categories) {
        catView = new CategoryView({ model: catModel }, config).render();
        this.renderedCategories[catId] = catView;
        categories.appendChild(catView.el);
      }

      catView && catView.append(rendered);
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
    this.renderedCategories = {};
    this.el.innerHTML = `
      <div class="${this.catsClass}"></div>
      <div class="${this.noCatClass}">
        <div class="${this.blockContClass}"></div>
      </div>
    `;

    this.collection.each(model => this.add(model, frag));
    this.append(frag);
    const cls = `${this.blockContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    this.$el.addClass(cls);
    this.rendered = true;
    return this;
  }
}
