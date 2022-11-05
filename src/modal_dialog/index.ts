/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/modal_dialog/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  modal: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const modal = editor.Modal;
 * ```
 *
 * ## Available Events
 * * `modal:open` - Modal is opened
 * * `modal:close` - Modal is closed
 * * `modal` - Event triggered on any change related to the modal. An object containing all the available data about the triggered event is passed as an argument to the callback.
 *
 * ## Methods
 * * [open](#open)
 * * [close](#close)
 * * [isOpen](#isopen)
 * * [setTitle](#settitle)
 * * [getTitle](#gettitle)
 * * [setContent](#setcontent)
 * * [getContent](#getcontent)
 * * [onceClose](#onceclose)
 * * [onceOpen](#onceopen)
 *
 * @module Modal
 */

import { EventHandler } from 'backbone';
import { debounce, isFunction, isString } from 'underscore';
import { Module } from '../abstract';
import EditorView from '../editor/view/EditorView';
import EditorModel from '../editor/model/Editor';
import { createText } from '../utils/dom';
import defaults, { ModalConfig } from './config/config';
import ModalM from './model/Modal';
import ModalView from './view/ModalView';

export default class ModalModule extends Module<ModalConfig> {
  modal?: ModalView;

  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'Modal', defaults);

    this.model = new ModalM(this);
    this.model.on('change:open', (m: ModalM, enable: boolean) => {
      em.trigger(`modal:${enable ? 'open' : 'close'}`);
    });
    this.model.on(
      'change',
      debounce(() => {
        const data = this._evData();
        const { custom } = this.config;
        //@ts-ignore
        isFunction(custom) && custom(data);
        em.trigger('modal', data);
      }, 0)
    );

    return this;
  }

  _evData() {
    const titl = this.getTitle();
    const cnt = this.getContent();
    const { open, attributes } = this.model.attributes;
    return {
      open,
      attributes,
      title: isString(titl) ? createText(titl) : titl,
      //@ts-ignore
      content: isString(cnt) ? createText(cnt) : cnt.get ? cnt.get(0) : cnt,
      close: () => this.close(),
    };
  }

  postRender(view: EditorView) {
    const el = view.model.config.el || view.el;
    const res = this.render();
    res && el?.appendChild(res);
  }

  /**
   * Open the modal window
   * @param {Object} [opts={}] Options
   * @param {String|HTMLElement} [opts.title] Title to set for the modal
   * @param {String|HTMLElement} [opts.content] Content to set for the modal
   * @param {Object} [opts.attributes] Updates the modal wrapper with custom attributes
   * @returns {this}
   * @example
   * modal.open({
   *   title: 'My title',
   *   content: 'My content',
   *   attributes: { class: 'my-class' },
   * });
   */
  open(opts: any = {}) {
    const attr = opts.attributes || {};
    opts.title && this.setTitle(opts.title);
    opts.content && this.setContent(opts.content);
    this.model.set('attributes', attr);
    this.model.open();
    this.modal && this.modal.updateAttr(attr);
    return this;
  }

  /**
   * Close the modal window
   * @returns {this}
   * @example
   * modal.close();
   */
  close() {
    this.model.close();
    return this;
  }

  /**
   * Execute callback when the modal will be closed.
   * The callback will be called one only time
   * @param {Function} clb Callback to call
   * @returns {this}
   * @example
   * modal.onceClose(() => {
   *  console.log('The modal is closed');
   * });
   */
  onceClose(clb: EventHandler) {
    this.em.once('modal:close', clb);
    return this;
  }

  /**
   * Execute callback when the modal will be opened.
   * The callback will be called one only time
   * @param {Function} clb Callback to call
   * @returns {this}
   * @example
   * modal.onceOpen(() => {
   *  console.log('The modal is opened');
   * });
   */
  onceOpen(clb: EventHandler) {
    this.em.once('modal:open', clb);
    return this;
  }

  /**
   * Checks if the modal window is open
   * @returns {Boolean}
   * @example
   * modal.isOpen(); // true | false
   */
  isOpen() {
    return !!this.model.get('open');
  }

  /**
   * Set the title to the modal window
   * @param {string | HTMLElement} title Title
   * @returns {this}
   * @example
   * // pass a string
   * modal.setTitle('Some title');
   * // or an HTMLElement
   * const el = document.createElement('div');
   * el.innerText =  'New title';
   * modal.setTitle(el);
   */
  setTitle(title: string) {
    this.model.set('title', title);
    return this;
  }

  /**
   * Returns the title of the modal window
   * @returns {string | HTMLElement}
   * @example
   * modal.getTitle();
   */
  getTitle() {
    return this.model.get('title');
  }

  /**
   * Set the content of the modal window
   * @param {string | HTMLElement} content Content
   * @returns {this}
   * @example
   * // pass a string
   * modal.setContent('Some content');
   * // or an HTMLElement
   * const el = document.createElement('div');
   * el.innerText =  'New content';
   * modal.setContent(el);
   */
  setContent(content: string | HTMLElement) {
    this.model.set('content', ' ');
    this.model.set('content', content);
    return this;
  }

  /**
   * Get the content of the modal window
   * @returns {string | HTMLElement}
   * @example
   * modal.getContent();
   */
  getContent(): string | HTMLElement {
    return this.model.get('content');
  }

  /**
   * Returns content element
   * @return {HTMLElement}
   * @private
   */
  getContentEl(): HTMLElement | undefined {
    return this.modal?.getContent().get(0);
  }

  /**
   * Returns modal model
   * @return {Model}
   * @private
   */
  getModel() {
    return this.model;
  }

  /**
   * Render the modal window
   * @return {HTMLElement}
   * @private
   */
  render(): HTMLElement | undefined {
    if (this.config.custom) return;
    const View = ModalView.extend(this.config.extend);
    const el = this.modal && this.modal.el;
    this.modal = new View({
      el,
      model: this.model,
      config: this.config,
    });
    return this.modal?.render().el;
  }

  destroy() {
    this.modal?.remove();
  }
}
