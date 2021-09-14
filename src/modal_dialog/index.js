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

import { debounce, isFunction, isString } from 'underscore';
import { createText } from '../utils/dom';
import defaults from './config/config';
import ModalM from './model/Modal';
import ModalView from './view/ModalView';

export default () => {
  var c = {};
  var model, modal;

  const triggerEvent = (enable, em) => {
    em && em.trigger(`modal:${enable ? 'open' : 'close'}`);
  };

  return {
    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'Modal',

    getConfig() {
      return c;
    },

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @private
     */
    init(config = {}) {
      c = {
        ...defaults,
        ...config
      };

      const em = c.em;
      this.em = em;
      var ppfx = c.pStylePrefix;
      if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;

      model = new ModalM(c);
      model.on('change:open', (m, enb) => triggerEvent(enb, em));
      model.on(
        'change',
        debounce(() => {
          const data = this._evData();
          const { custom } = this.getConfig();
          isFunction(custom) && custom(data);
          em.trigger('modal', data);
        })
      );

      return this;
    },

    _evData() {
      const titl = this.getTitle();
      const cnt = this.getContent();
      const { open, attributes } = model.attributes;
      return {
        open,
        attributes,
        title: isString(titl) ? createText(titl) : titl,
        content: isString(cnt) ? createText(cnt) : cnt.get ? cnt.get(0) : cnt,
        close: () => this.close()
      };
    },

    postRender(view) {
      const el = view.model.getConfig().el || view.el;
      const res = this.render();
      res && res.appendTo(el);
    },

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
    open(opts = {}) {
      const attr = opts.attributes || {};
      opts.title && this.setTitle(opts.title);
      opts.content && this.setContent(opts.content);
      model.set('attributes', attr);
      model.open();
      modal && modal.updateAttr(attr);
      return this;
    },

    /**
     * Close the modal window
     * @returns {this}
     * @example
     * modal.close();
     */
    close() {
      model.close();
      return this;
    },

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
    onceClose(clb) {
      this.em.once('modal:close', clb);
      return this;
    },

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
    onceOpen(clb) {
      this.em.once('modal:open', clb);
      return this;
    },

    /**
     * Checks if the modal window is open
     * @returns {Boolean}
     * @example
     * modal.isOpen(); // true | false
     */
    isOpen() {
      return !!model.get('open');
    },

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
    setTitle(title) {
      model.set('title', title);
      return this;
    },

    /**
     * Returns the title of the modal window
     * @returns {string | HTMLElement}
     * @example
     * modal.getTitle();
     */
    getTitle() {
      return model.get('title');
    },

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
    setContent(content) {
      model.set('content', ' ');
      model.set('content', content);
      return this;
    },

    /**
     * Get the content of the modal window
     * @returns {string | HTMLElement}
     * @example
     * modal.getContent();
     */
    getContent() {
      return model.get('content');
    },

    /**
     * Returns content element
     * @return {HTMLElement}
     * @private
     */
    getContentEl() {
      return modal.getContent().get(0);
    },

    /**
     * Returns modal model
     * @return {Model}
     * @private
     */
    getModel() {
      return model;
    },

    /**
     * Render the modal window
     * @return {HTMLElement}
     * @private
     */
    render() {
      if (this.getConfig().custom) return;
      const View = ModalView.extend(c.extend);
      const el = modal && modal.el;
      modal = new View({
        el,
        model,
        config: c
      });
      return modal.render().$el;
    },

    destroy() {
      modal && modal.remove();
      [c, model, modal].forEach(i => (i = {}));
      this.em = {};
    }
  };
};
