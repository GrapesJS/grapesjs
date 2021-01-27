import { isString, isObject } from 'underscore';
import CategoryView from 'category/view/CategoryView';
import DomainViews from 'domain_abstract/view/DomainViews';
import TraitView from './TraitView';
import TraitSelectView from './TraitSelectView';
import TraitCheckboxView from './TraitCheckboxView';
import TraitNumberView from './TraitNumberView';
import TraitColorView from './TraitColorView';
import TraitButtonView from './TraitButtonView';
import Filter from 'filter/view/FilterView';

export default DomainViews.extend({
  ns: 'Traits',
  itemView: TraitView,
  reuseView: 1,

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
    this.categories = o.categories || '';
    this.renderedCategories = [];
    this.className = this.pfx + 'traits';
    this.catsClass = `${this.ppfx}categories`;
    this.noCatClass = `${this.ppfx}no-cat`;
    this.contClass = `${this.ppfx}c`;
    const toListen = 'component:toggled';
    this.listenTo(this.em, toListen, this.updatedCollection);
    if (this.config.showSearch) {
      this.searchField = new Filter({
        clb: this.inclusiveSearchCallBack.bind(this),
        editor: this.em,
        ppfx: this.ppfx
      }).render();
    }

    this.updatedCollection();
  },

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    const ppfx = this.ppfx;
    const comp = this.em.getSelected();
    this.el.className = `${this.className} ${ppfx}one-bg ${ppfx}two-color`;
    this.collection = comp ? comp.get('traits') : [];
    // Need to guard access to each, due to being undefined in some observed cases where collection is not a backbone collection.
    this.collection.each &&
      this.collection.each(function(model) {
        model.set('visible', true);
      });

    this.render();
  },

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model, fragment) {
    const { config, reuseView, items, itemsView = {} } = this;
    const inputTypes = [
      'button',
      'checkbox',
      'color',
      'date',
      'datetime-local',
      'email',
      'file',
      'hidden',
      'image',
      'month',
      'number',
      'password',
      'radio',
      'range',
      'reset',
      'search',
      'submit',
      'tel',
      'text',
      'time',
      'url',
      'week'
    ];
    var frag = fragment || null;
    var itemView = this.itemView;
    var typeField = model.get(this.itemType);
    var category = model.get('category');
    let view;

    if (itemsView[typeField]) {
      itemView = itemsView[typeField];
    } else if (
      typeField &&
      !itemsView[typeField] &&
      !includes(inputTypes, typeField)
    ) {
      this.itemViewNotFound(typeField);
    }

    if (model.view && reuseView) {
      view = model.view;
    } else {
      view = new itemView({ model, config }, config);
    }

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
      var categories = this.getCategoriesEl();
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
      catView && catView.append(view.render().el);
      return;
    }

    items && items.push(view);
    const rendered = view.render().el;

    if (frag) frag.appendChild(rendered);
    else this.$el.append(rendered);
  },

  inclusiveSearchCallBack(value) {
    var index = 1;
    const processedValue = value ? value.toLowerCase() : '';
    this.collection.forEach(element => {
      const category = element.get('category');
      const categoryLabel = category ? category.id.toLowerCase() : '';
      if (
        !element.get('name').includes(processedValue) &&
        !categoryLabel.includes(processedValue)
      ) {
        element.set('visible', false);
      } else {
        element.set('visible', true);
      }

      if (index >= this.collection.length) {
        this.render();
      } else {
        index++;
      }
    });
  },

  getCategoriesEl() {
    if (!this.catsEl) {
      this.catsEl = this.el.querySelector(`.${this.catsClass}`);
    }

    return this.catsEl;
  },

  render() {
    var frag = document.createDocumentFragment();
    this.clearItems();
    this.$el.empty();
    this.catsEl = null;
    this.renderedCategories = [];

    this.el.innerHTML = `
      <div class="${this.catsClass}"></div>
      <div class="${this.noCatClass}"></div>
    `;

    this.searchField && this.$el.prepend(this.searchField.el);

    if (this.collection.length)
      this.collection.each(function(model) {
        model.get('visible') && this.add(model, frag);
      }, this);

    this.$el.append(frag);
    const cls = `${this.contClass}s ${this.ppfx}one-bg ${this.ppfx}two-color`;
    this.$el.addClass(cls);
    this.onRender();
    return this;
  }
});
