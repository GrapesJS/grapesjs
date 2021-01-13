import DomainViews from 'domain_abstract/view/DomainViews';
import TraitView from './TraitView';
import TraitSelectView from './TraitSelectView';
import TraitCheckboxView from './TraitCheckboxView';
import TraitNumberView from './TraitNumberView';
import TraitColorView from './TraitColorView';
import TraitButtonView from './TraitButtonView';
import TraitSearchView from './TraitSearchView';

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
    this.className = this.pfx + 'traits';
    const toListen = 'component:toggled';
    this.listenTo(this.em, toListen, this.updatedCollection);
    this.listenTo(this, 'updateComps', this.filterCollection);
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
    this.searchField =
      this.collection.length > 0
        ? new TraitSearchView({
            ppfx: this.ppfx,
            traits: this.collection,
            traitsView: this
          })
        : this.searchField;

    this.collection.each &&
      this.collection.each(function(model) {
        model.set('visible', true);
      });

    this.render();
  },

  filterCollection(fc) {
    console.log('event has triggered');
    this.collection = fc;
    this.render();
  },

  render() {
    var frag = document.createDocumentFragment();
    this.clearItems();
    this.$el.empty();

    this.searchField && this.$el.append(this.searchField.render().el);
    if (this.collection.length)
      this.collection.each(function(model) {
        model.get('visible') && this.add(model, frag);
      }, this);

    this.$el.append(frag);
    this.onRender();
    return this;
  }
});
