import { isString, isObject, bindAll } from 'underscore';

const DomainViews = require('domain_abstract/view/DomainViews');
const TraitView = require('./TraitView');
const TraitSelectView = require('./TraitSelectView');
const TraitCheckboxView = require('./TraitCheckboxView');
const TraitNumberView = require('./TraitNumberView');
const TraitColorView = require('./TraitColorView');
const TraitButtonView = require('./TraitButtonView');
const CategoryView = require('./CategoryView');

module.exports = DomainViews.extend({
  itemView: TraitView,

  itemsView: {
    text: TraitView,
    number: TraitNumberView,
    select: TraitSelectView,
    checkbox: TraitCheckboxView,
    color: TraitColorView,
    button: TraitButtonView
  },

  initialize(o = {}) {
    const config = o.config || {};
    this.config = config;
    this.em = o.editor;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.className = this.pfx + 'traits';
    this.categories = o.categories || '';
    this.renderedCategories = [];
    this.noCatClass = `${this.ppfx}traits-no-cat`;
    this.traitContClass = `${this.pfx}traits`;
    this.catsClass = `${this.ppfx}traits-categories`;
    const toListen = 'component:toggled';
    this.listenTo(this.em, toListen, this.updatedCollection);
    this.updatedCollection();
  },

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    const ppfx = this.ppfx;
    const comp = this.em.getSelected();
    this.el.className = `${ppfx}one-bg ${ppfx}two-color`;
    this.collection = comp ? comp.get('traits') : [];
    this.render();
  },

  updateConfig(opts = {}) {
    this.config = {
      ...this.config,
      ...opts
    };
  },

  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   */
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
    const { config } = this;
    var frag = fragment || null;
    var itemView = this.itemView;
    var typeField = model.get(this.itemType);
    if (this.itemsView && this.itemsView[typeField]) {
      itemView = this.itemsView[typeField];
    }
    var view = new itemView({
      config,
      model,
      attributes: model.get('attributes')
    });
    var rendered = view.render().el;
    var category = model.get('category');

    // Check for categories
    if (category && this.categories && !config.ignoreCategories) {
      if (isString(category)) {
        category = {
          id: category,
          label: category
        };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      var catModel = this.categories.add(category);
      var catId = catModel.get('id');
      var catView = this.renderedCategories[catId];
      var categories = this.getCategoriesEl();
      model.set('category', catModel);

      if (!catView && categories) {
        catView = new CategoryView(
          {
            model: catModel
          },
          this.config
        ).render();
        this.renderedCategories[catId] = catView;
        categories.appendChild(catView.el);
      }

      catView && catView.append(rendered);
      return;
    }

    if (frag) frag.appendChild(rendered);
    else this.append(rendered);
  },

  getCategoriesEl() {
    if (!this.catsEl) {
      this.catsEl = this.el.querySelector(`.${this.catsClass}`);
    }

    return this.catsEl;
  },

  getTraitsEl() {
    if (!this.traitsEl) {
      this.traitsEl = this.el.querySelector(
        `.${this.noCatClass} .${this.traitContClass}`
      );
    }

    return this.traitsEl;
  },

  append(el) {
    let traits = this.getTraitsEl();
    traits && traits.appendChild(el);
  },

  render() {
    const ppfx = this.ppfx;
    const frag = document.createDocumentFragment();
    this.catsEl = null;
    this.traitsEl = null;
    this.renderedCategories = [];
    this.el.innerHTML = `
    <div class="${this.catsClass}"></div>
    <div class="${this.noCatClass}">
      <div class="${this.traitContClass}"></div>
    </div>
  `;
    if (this.collection.length)
      this.collection.each(model => this.add(model, frag));
    this.append(frag);
    const cls = `${ppfx}one-bg ${ppfx}two-color`;
    this.$el.addClass(cls);
    return this;
  }
});
