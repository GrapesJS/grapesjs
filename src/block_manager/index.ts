/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/block_manager/config/config.ts)
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
 * {REPLACE_EVENTS}
 *
 * [Block]: block.html
 * [Component]: component.html
 *
 * @module Blocks
 */
import { debounce, isArray } from 'underscore';
import { ItemManagerModule } from '../abstract/Module';
import FrameView from '../canvas/view/FrameView';
import Component from '../dom_components/model/Component';
import EditorModel from '../editor/model/Editor';
import defaults, { BlockManagerConfig } from './config/config';
import Block, { BlockProperties } from './model/Block';
import Blocks from './model/Blocks';
import Categories from './model/Categories';
import Category from './model/Category';
import { BlocksEvents } from './types';
import BlocksView from './view/BlocksView';

export type BlockEvent = `${BlocksEvents}`;

export default class BlockManager extends ItemManagerModule<BlockManagerConfig, Blocks> {
  blocks: Blocks;
  blocksVisible: Blocks;
  categories: Categories;
  blocksView?: BlocksView;
  _dragBlock?: Block;
  _bhv?: Record<string, any>;
  events = BlocksEvents;

  Block = Block;

  Blocks = Blocks;

  Category = Category;

  Categories = Categories;

  storageKey = '';

  constructor(em: EditorModel) {
    super(em, 'BlockManager', new Blocks(em.config.blockManager?.blocks || []), BlocksEvents, defaults);

    // Global blocks collection
    this.blocks = this.all;
    this.blocksVisible = new Blocks(this.blocks.models);
    this.categories = new Categories();

    // Setup the sync between the global and public collections
    this.blocks.on('add', model => this.blocksVisible.add(model));
    this.blocks.on('remove', model => this.blocksVisible.remove(model));
    this.blocks.on('reset', coll => this.blocksVisible.reset(coll.models));

    this.__onAllEvent = debounce(() => this.__trgCustom(), 0);

    return this;
  }

  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  __trgCustom() {
    this.em.trigger(this.events.custom, this.__customData());
  }

  __customData() {
    const bhv = this.__getBehaviour();
    return {
      bm: this as BlockManager,
      blocks: this.getAll().models,
      container: bhv.container,
      dragStart: (block: Block, ev?: Event) => this.startDrag(block, ev),
      drag: (ev: Event) => this.__drag(ev),
      dragStop: (cancel?: boolean) => this.endDrag(cancel),
    };
  }

  __startDrag(block: Block, ev?: Event) {
    const { em, events, blocks } = this;
    const content = block.getContent ? block.getContent() : block;
    this._dragBlock = block;
    em.set({ dragResult: null, dragContent: content });
    [em, blocks].map(i => i.trigger(events.dragStart, block, ev));
  }

  __drag(ev: Event) {
    const { em, events, blocks } = this;
    const block = this._dragBlock;
    [em, blocks].map(i => i.trigger(events.drag, block, ev));
  }

  __endDrag(opts: { component?: Component } = {}) {
    const { em, events, blocks } = this;
    const block = this._dragBlock;
    const cmp = opts.component || em.get('dragResult');
    delete this._dragBlock;

    if (cmp && block) {
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
        first.onAll((cmp: any) => cmp.resetId());
      }
    }

    em.set({ dragResult: null, dragContent: null });

    if (block) {
      [em, blocks].map(i => i.trigger(events.dragEnd, cmp, block));
    }
  }

  __getFrameViews(): FrameView[] {
    return this.em.Canvas.getFrames()
      .map(frame => frame.view!)
      .filter(Boolean);
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

  startDrag(block: Block, ev?: Event) {
    this.__startDrag(block, ev);
    this.__getFrameViews().forEach(fv => fv.droppable?.startCustom());
  }

  endDrag(cancel?: boolean) {
    this.__getFrameViews().forEach(fv => fv.droppable?.endCustom(cancel));
    this.__endDrag();
  }

  postRender() {
    const { categories, config, em } = this;
    const collection = this.blocksVisible;
    this.blocksView = new BlocksView({ collection, categories }, { ...config, em });
    this.__appendTo(collection.models);
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
  add(id: string, props: BlockProperties, opts = {}) {
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
  get(id: string) {
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
  remove(block: string | Block, opts = {}) {
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
    return this.blocksView?.el;
  }

  /**
   * Returns currently dragging block.
   * Updated when the drag starts and cleared once it's done.
   * @returns {[Block]|undefined}
   */
  getDragBlock() {
    return this._dragBlock;
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
  render(blocks?: Block[], opts: { external?: boolean } = {}) {
    const { categories, config, em } = this;
    const toRender = blocks || this.getAll().models;

    if (opts.external) {
      const collection = new Blocks(toRender);
      return new BlocksView({ collection, categories }, { em, ...config, ...opts }).render().el;
    }

    if (this.blocksView) {
      this.blocksView.updateConfig(opts);
      this.blocksView.collection.reset(toRender);

      if (!this.blocksView.rendered) {
        this.blocksView.render();
        this.blocksView.rendered = true;
      }
    }

    return this.getContainer();
  }

  destroy() {
    const colls = [this.blocks, this.blocksVisible, this.categories];
    colls.map(c => c.stopListening());
    colls.map(c => c.reset());
    this.blocksView?.remove();
  }
}
