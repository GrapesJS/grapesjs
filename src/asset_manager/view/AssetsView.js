var AssetView = require('./AssetView');
var AssetImageView = require('./AssetImageView');
var FileUploader = require('./FileUploader');

module.exports = Backbone.View.extend({

  events: {
    submit: 'handleSubmit',
  },

  template(view) {
    const pfx = view.pfx;
    const ppfx = view.ppfx;
    return `
    <div class="${pfx}assets-cont">
      <div class="${pfx}assets-header">
        <form class="${pfx}add-asset">
          <div class="${ppfx}field ${pfx}add-field">
            <input placeholder="http://path/to/the/image.jpg"/>
          </div>
          <button class="${ppfx}btn-prim">${view.config.addBtnText}</button>
          <div style="clear:both"></div>
        </form>
        <div class="${pfx}dips" style="display:none">
          <button class="fa fa-th <%${ppfx}btnt"></button>
          <button class="fa fa-th-list <%${ppfx}btnt"></button>
        </div>
      </div>
      <div class="${pfx}assets" data-el="assets"></div>
      <div style="clear:both"></div>
    </div>
    `;
  },

  initialize(o) {
    this.options = o;
    this.config = o.config;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.listenTo(this.collection, 'add', this.addToAsset );
    this.listenTo(this.collection, 'deselectAll', this.deselectAll);
    this.listenTo(this.collection, 'reset', this.render);
    /*
    this.events = {};
    this.events.submit = 'addFromStr';
    this.delegateEvents();
    */
  },

  /**
   * Add new asset to the collection via string
   * @param {Event} e Event object
   * @return {this}
   * @private
   */
  handleSubmit(e) {
    e.preventDefault();
    const input = this.getAddInput();
    const url = input.value.trim();
    const handleAdd = this.config.handleAdd;

    if (!url) {
      return;
    }

    input.value = '';
    this.getAssetsEl().scrollTop = 0;

    if (handleAdd) {
      handleAdd(url);
    } else {
      this.options.globalCollection.add(url, {at: 0});
    }
  },

  /**
   * Returns assets element
   * @return {HTMLElement}
   * @private
   */
  getAssetsEl() {
    //if(!this.assets) // Not able to cache as after the rerender it losses the ref
    return this.el.querySelector(`.${this.pfx}assets`);
  },

  /**
   * Returns input url element
   * @return {HTMLElement}
   * @private
   */
  getAddInput() {
    if(!this.inputUrl || !this.inputUrl.value)
      this.inputUrl = this.el.querySelector(`.${this.pfx}add-asset input`);
    return this.inputUrl;
  },

  /**
   * Add asset to collection
   * @private
   * */
  addToAsset(model) {
    this.addAsset(model);
  },

  /**
   * Add new asset to collection
   * @param Object Model
   * @param Object Fragment collection
   * @return Object Object created
   * @private
   * */
  addAsset(model, fragmentEl = null) {
    const fragment = fragmentEl;
    const collection = this.collection;
    const config = this.config;
    const rendered = new model.typeView({
      model,
      collection,
      config,
    }).render().el;

    if (fragment) {
      fragment.appendChild( rendered );
    } else {
      const assetsEl = this.getAssetsEl();
      if (assetsEl) {
        assetsEl.insertBefore(rendered, assetsEl.firstChild);
      }
    }

    return rendered;
  },

  /**
   * Deselect all assets
   * @private
   * */
  deselectAll() {
    const pfx = this.pfx;
    this.$el.find(`.${pfx}highlight`).removeClass(`${pfx}highlight`);
  },

  render() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const fuRendered = this.options.fu.render().el;
    const fragment = document.createDocumentFragment();
    this.$el.empty();

    this.collection.each((model) => {
      this.addAsset(model, fragment);
    });

    this.$el.append(fuRendered).append(this.template(this));
    this.el.className = `${ppfx}asset-manager`;
    this.$el.find(`.${pfx}assets`).append(fragment);
    return this;
  }
});
