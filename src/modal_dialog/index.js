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

      return this;
    },

    postRender(view) {
      const el = view.model.getConfig().el || view.el;
      this.render().appendTo(el);
    },

    /**
     * Open the modal window
     * @param {Object} [opts={}] Options
     * @param {String|HTMLElement} [opts.title] Title to set for the modal
     * @param {String|HTMLElement} [opts.content] Content to set for the modal
     * @param {Object} [opts.attributes] Updates the modal wrapper with custom attributes
     * @return {this}
     */
    open(opts = {}) {
      opts.title && this.setTitle(opts.title);
      opts.content && this.setContent(opts.content);
      model.open();
      modal && modal.updateAttr(opts.attributes);
      return this;
    },

    /**
     * Close the modal window
     * @return {this}
     */
    close() {
      model.close();
      return this;
    },

    /**
     * Execute callback when the modal will be closed.
     * The callback will be called one only time
     * @param {Function} clb
     * @returns {this}
     */
    onceClose(clb) {
      this.em.once('modal:close', clb);
      return this;
    },

    /**
     * Execute callback when the modal will be opened.
     * The callback will be called one only time
     * @param {Function} clb
     * @returns {this}
     */
    onceOpen(clb) {
      this.em.once('modal:open', clb);
      return this;
    },

    /**
     * Checks if the modal window is open
     * @return {Boolean}
     */
    isOpen() {
      return !!model.get('open');
    },

    /**
     * Set the title to the modal window
     * @param {string} title Title
     * @return {this}
     * @example
     * modal.setTitle('New title');
     */
    setTitle(title) {
      model.set('title', title);
      return this;
    },

    /**
     * Returns the title of the modal window
     * @return {string}
     */
    getTitle() {
      return model.get('title');
    },

    /**
     * Set the content of the modal window
     * @param {string|HTMLElement} content Content
     * @return {this}
     * @example
     * modal.setContent('<div>Some HTML content</div>');
     */
    setContent(content) {
      model.set('content', ' ');
      model.set('content', content);
      return this;
    },

    /**
     * Get the content of the modal window
     * @return {string}
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
      const View = ModalView.extend(c.extend);
      modal && modal.remove();
      modal = new View({
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
