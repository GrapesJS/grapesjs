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
    this.componentToggledListener = 'component:toggled'; //** CCIDE select / deselect optimization
    this.config.catClass = 'c';

    //** CCIDE select / deselect optimization
    this.enableViewCollectionUpdatedEventHandler();

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
    const comp = this.em.getSelectedAll();
    // check if there are more than one component selected and get the last selected value (last elemented pushed)
    this.lastComp = comp.length > 0 ? comp[comp.length - 1] : undefined;
    this.el.className = `${this.className} ${ppfx}one-bg ${ppfx}two-color`;
    this.collection = {}; // object used as a map.

    comp.length &&
      comp.forEach(comp => {
        var self = this; // need to keep upper level scope
        self.lastComp.get('traits').each(trait => {
          var tta;
          if (
            (tta = comp.get('traits').findWhere({ name: trait.get('name') }))
          ) {
            if (self.collection[tta.id]) {
              self.collection[tta.id].push(tta);
            } else {
              self.collection[tta.id] = [tta];
            }
          }
        });
      });

    // process buckets and clean out unwanted data
    Object.keys(this.collection).forEach(key => {
      if (this.collection[key] && this.collection[key].length != comp.length) {
        delete this.collection[key];
      }
    });

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
  add(models, fragment) {
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
    var typeField = models ? models[models.length - 1].get(this.itemType) : '';
    var category = models ? models[models.length - 1].get('category') : '';
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
    view = new itemView({ models: models, config }, config);

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
      models[models.length - 1].set('category', catModel);

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
    Object.keys(this.collection).forEach(key => {
      this.collection[key].forEach(comp => {
        const category = comp.get('category');
        const categoryLabel = category ? category.id.toLowerCase() : '';
        if (
          !comp.get('name').includes(processedValue) &&
          !categoryLabel.includes(processedValue)
        ) {
          comp.set('visible', false);
        } else {
          comp.set('visible', true);
        }
      });
      if (index >= Object.keys(this.collection).length) {
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

    if (Object.keys(this.collection).length) {
      Object.keys(this.collection).forEach(key => {
        this.collection[key][0].get('visible') &&
          this.add(this.collection[key], frag);
      }, this);
    }

    this.$el.append(frag);
    const cls = `${this.contClass}s ${this.ppfx}one-bg ${this.ppfx}two-color`;
    this.$el.addClass(cls);
    this.onRender();
    return this;
  },
  disableViewCollectionUpdatedEventHandler() {
    //** CCIDE select / deselect optimization
    this.stopListening(
      this.em,
      this.componentToggledListener,
      this.updatedCollection
    );
  },
  enableViewCollectionUpdatedEventHandler() {
    //** CCIDE select / deselect optimization
    this.listenTo(
      this.em,
      this.componentToggledListener,
      this.updatedCollection
    );
  }
});
