var Backbone = require('backbone');
var CategoryView = require('./CategoryView');
var Categories = require('../model/Categories');

module.exports = Backbone.View.extend({

  categorizableView: '',

  categorizableType: '',

  initialize(opts, config) {
    this.config = config || {};
    this.categories = new Categories(),
    this.renderedCategories = [];
    var ppfx = this.config.pStylePrefix || '';
    var ct = this.categorizableType;
    this.ppfx = ppfx;
    this.noCatClass = `${ppfx}${ct}-no-cat`;
    this.contClass = `${ppfx}${ct}-c`;
    this.catsClass = `${ppfx}${ct}-categories`;
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
  },

  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   * */
  addTo(model) {
    this.add(model);
  },

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model, fragment) {
    var frag = fragment || null;
    var categorizableView = this.categorizableView;
    var view = new categorizableView({
      model,
      attributes: model.get('attributes'),
    }, this.config);
    var rendered = view.render().el;
    var category = model.get('category');

    // Check for categories
    if (category && this.categories) {
      if (typeof category == 'string') {
        category = {
          id: category,
          label: category,
          type: this.categorizableType
        };
      }

      var catModel = this.categories.add(category);
      var catId = catModel.get('id');
      var catView = this.renderedCategories[catId];
      var categories = this.getCategoriesEl();
      model.set('category', catModel);

      if (!catView && categories) {
        catView = new CategoryView({
          model: catModel
        }, this.config).render();
        this.renderedCategories[catId] = catView;
        categories.appendChild(catView.el);
      }

      catView && catView.append(rendered);
      return;
    }

    if(frag)
      frag.appendChild(rendered);
    else
      this.append(rendered);
  },

  getCategoriesEl() {
    if (!this.catsEl) {
      this.catsEl = this.el.querySelector(`.${this.catsClass}`);
    }

    return this.catsEl;
  },

  getContainerEl() {
    if (!this.containerEl) {
      this.containerEl = this.el.querySelector(`.${this.noCatClass} .${this.contClass}`);
    }

    return this.containerEl;
  },

  append(el) {
    let container = this.getContainerEl();
    container && container.appendChild(el);
  },

  render() {
    const frag = document.createDocumentFragment();
    this.catsEl = null;
    this.containerEl = null;
    this.renderedCategories = [];
    this.el.innerHTML = `
      <div class="${this.catsClass}"></div>
      <div class="${this.noCatClass}">
        <div class="${this.contClass}"></div>
      </div>
    `;

    this.collection.each(model => this.add(model, frag));
    this.append(frag);
    this.$el.addClass(this.contClass + 's')
    return this;
  },

});
