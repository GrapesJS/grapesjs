/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/block_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  blockManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('block:add', (block) => { ... });
 *
 * // Use the API
 * const blockManager = editor.Blocks;
 * blockManager.add(...);
 * ```
 *
 * ## Available Events
 * * `block:add` - Block added. The [Block] is passed as an argument to the callback.
 * * `block:remove` - Block removed. The [Block] is passed as an argument to the callback.
 * * `block:update` - Block updated. The [Block] and the object containing changes are passed as arguments to the callback.
 * * `block:drag:start` - Started dragging block, the [Block] is passed as an argument.
 * * `block:drag` - Dragging block, the [Block] is passed as an argument.
 * * `block:drag:stop` - Dragging of the block is stopped. The dropped [Component] (if dropped successfully) and the [Block] are passed as arguments.
 * * `block` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
 *
 * ## Methods
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getAllVisible](#getallvisible)
 * * [remove](#remove)
 * * [getConfig](#getconfig)
 * * [getCategories](#getcategories)
 * * [getContainer](#getcontainer)
 * * [render](#render)
 *
 * [Block]: block.html
 * [Component]: component.html
 *
 * @module Blocks
 */
import { isElement, isArray } from 'underscore';
import Module from '../abstract/moduleLegacy';
import defaults from './config/config';
import Block from './model/Block';
import Blocks from './model/Blocks';
import Category from './model/Category';
import Categories from './model/Categories';
import BlocksView from './view/BlocksView';

export const evAll = 'block';
export const evPfx = `${evAll}:`;
export const evAdd = `${evPfx}add`;
export const evUpdate = `${evPfx}update`;
export const evRemove = `${evPfx}remove`;
export const evRemoveBefore = `${evRemove}:before`;
export const evDrag = `${evPfx}drag`;
export const evDragStart = `${evDrag}:start`;
export const evDragStop = `${evDrag}:stop`;
export const evCustom = `${evPfx}custom`;

export default class BlockManager extends Module {
  name = 'BlockManager';

  Block = Block;

  Blocks = Blocks;

  Category = Category;

  Categories = Categories;

  events = {
    all: evAll,
    update: evUpdate,
    add: evAdd,
    remove: evRemove,
    removeBefore: evRemoveBefore,
    drag: evDrag,
    dragStart: evDragStart,
    dragEnd: evDragStop,
    custom: evCustom,
  };

  init(config = {}) {
    this.c = { ...defaults, ...config };
    const { em } = this.c;
    this.em = em;

    // Global blocks collection
    this.blocks = new Blocks(this.c.blocks);
    this.blocksVisible = new Blocks(this.blocks.models);
    this.categories = new Categories();
    this.all = this.blocks;
    this.__initListen();

    // Setup the sync between the global and public collections
    this.blocks.on('add', model => this.blocksVisible.add(model));
    this.blocks.on('remove', model => this.blocksVisible.remove(model));
    this.blocks.on('reset', coll => this.blocksVisible.reset(coll.models));

    return this;
  }

  __trgCustom() {
    this.em.trigger(this.events.custom, this.__customData());
  }

  __customData() {
    const bhv = this.__getBehaviour();
    return {
      bm: this,
      blocks: this.getAll().models,
      container: bhv.container,
      dragStart: (block, ev) => this.startDrag(block, ev),
      drag: ev => this.__drag(ev),
      dragStop: cancel => this.endDrag(cancel),
    };
  }

  __startDrag(block, ev) {
    const { em, events, blocks } = this;
    const content = block.getContent ? block.getContent() : block;
    this._dragBlock = block;
    em.set({ dragResult: null, dragContent: content });
    [em, blocks].map(i => i.trigger(events.dragStart, block, ev));
  }

  __drag(ev) {
    const { em, events, blocks } = this;
    const block = this._dragBlock;
    [em, blocks].map(i => i.trigger(events.drag, block, ev));
  }

  __endDrag() {
    const { em, events, blocks } = this;
    const block = this._dragBlock;
    const cmp = em.get('dragResult');
    this._dragBlock = null;

    if (cmp) {
      const oldKey = 'activeOnRender';
      const oldActive = cmp.get && cmp.get(oldKey);
      const toActive = block.get('activate') || oldActive;
      const toSelect = block.get('select');
      const first = isArray(cmp) ? cmp[0] : cmp;

      if (toSelect || (toActive && toSelect !== false)) {
        em.setSelected(first);
      }

      if (toActive) {
        first.trigger('active');
        oldActive && first.unset(oldKey);
      }

      if (block.get('resetId')) {
        first.onAll(block => block.resetId());
      }
    }

    em.set({ dragResult: null, dragContent: null });
    [em, blocks].map(i => i.trigger(events.dragEnd, cmp, block));
  }

  __getFrameViews() {
    return this.em
      .get('Canvas')
      .getFrames()
      .map(frame => frame.view);
  }

  __behaviour(opts = {}) {
    return (this._bhv = {
      ...(this._bhv || {}),
      ...opts,
    });
  }

  __getBehaviour() {
    return this._bhv || {};
  }

  startDrag(block, ev) {
    this.__startDrag(block, ev);
    this.__getFrameViews().forEach(fv => fv.droppable.startCustom());
  }

  endDrag(cancel) {
    this.__getFrameViews().forEach(fv => fv.droppable.endCustom(cancel));
    this.__endDrag();
  }

  /**
   * Get configuration object
   * @return {Object}
   */
  getConfig() {
    return this.c;
  }

  postRender() {
    const { categories } = this;
    const collection = this.blocksVisible;
    this.blocksView = new BlocksView({ collection, categories }, this.c);
    const elTo = this.getConfig().appendTo;

    if (elTo) {
      const el = isElement(elTo) ? elTo : document.querySelector(elTo);
      if (!el) return this.__logWarn('"appendTo" element not found');
      el.appendChild(this.render(this.blocksVisible.models));
    }

    this.__trgCustom();
  }

  /**
   * Add new block.
   * @param {String} id Block ID
   * @param {[Block]} props Block properties
   * @returns {[Block]} Added block
   * @example
   * blockManager.add('h1-block', {
   *   label: 'Heading',
   *   content: '<h1>Put your title here</h1>',
   *   category: 'Basic',
   *   attributes: {
   *     title: 'Insert h1 block'
   *   }
   * });
   */
  add(id, props, opts = {}) {
    const prp = props || {};
    prp.id = id;
    return this.blocks.add(prp, opts);
  }

  /**
   * Get the block by id.
   * @param  {String} id Block id
   * @returns {[Block]}
   * @example
   * const block = blockManager.get('h1-block');
   * console.log(JSON.stringify(block));
   * // {label: 'Heading', content: '<h1>Put your ...', ...}
   */
  get(id) {
    return this.blocks.get(id);
  }

  /**
   * Return all blocks.
   * @returns {Collection<[Block]>}
   * @example
   * const blocks = blockManager.getAll();
   * console.log(JSON.stringify(blocks));
   * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
   */
  getAll() {
    return this.blocks;
  }

  /**
   * Return the visible collection, which containes blocks actually rendered
   * @returns {Collection<[Block]>}
   */
  getAllVisible() {
    return this.blocksVisible;
  }

  /**
   * Remove block.
   * @param {String|[Block]} block Block or block ID
   * @returns {[Block]} Removed block
   * @example
   * const removed = blockManager.remove('BLOCK_ID');
   * // or by passing the Block
   * const block = blockManager.get('BLOCK_ID');
   * blockManager.remove(block);
   */
  remove(block, opts = {}) {
    return this.__remove(block, opts);
  }

  /**
   * Get all available categories.
   * It's possible to add categories only within blocks via 'add()' method
   * @return {Array|Collection}
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Return the Blocks container element
   * @return {HTMLElement}
   */
  getContainer() {
    return this.blocksView.el;
  }

  /**
   * Render blocks
   * @param  {Array} blocks Blocks to render, without the argument will render all global blocks
   * @param  {Object} [opts={}] Options
   * @param  {Boolean} [opts.external] Render blocks in a new container (HTMLElement will be returned)
   * @param  {Boolean} [opts.ignoreCategories] Render blocks without categories
   * @return {HTMLElement} Rendered element
   * @example
   * // Render all blocks (inside the global collection)
   * blockManager.render();
   *
   * // Render new set of blocks
   * const blocks = blockManager.getAll();
   * const filtered = blocks.filter(block => block.get('category') == 'sections')
   *
   * blockManager.render(filtered);
   * // Or a new set from an array
   * blockManager.render([
   *  {label: 'Label text', content: '<div>Content</div>'}
   * ]);
   *
   * // Back to blocks from the global collection
   * blockManager.render();
   *
   * // You can also render your blocks outside of the main block container
   * const newBlocksEl = blockManager.render(filtered, { external: true });
   * document.getElementById('some-id').appendChild(newBlocksEl);
   */
  render(blocks, opts = {}) {
    const { categories } = this.categories;
    const toRender = blocks || this.getAll().models;

    if (opts.external) {
      const collection = new Blocks(toRender);
      return new BlocksView({ collection, categories }, { ...this.c, ...opts }).render().el;
    }

    if (this.blocksView) {
      this.blocksView.updateConfig(opts);
      this.blocksView.collection.reset(toRender);

      if (!this.blocksView.rendered) {
        this.blocksView.render();
        this.blocksView.rendered = 1;
      }
    }

    return this.getContainer();
  }

  destroy() {
    const colls = [this.blocks, this.blocksVisible, this.categories];
    colls.map(c => c.stopListening());
    colls.map(c => c.reset());
    this.blocksView?.remove();
    this.c = {};
    this.blocks = {};
    this.blocksVisible = {};
    this.blocksView = {};
    this.categories = [];
    this.all = {};
  }
}
