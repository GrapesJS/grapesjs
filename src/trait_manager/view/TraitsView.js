import DomainViews from 'domain_abstract/view/DomainViews';
import TraitView from './TraitView';
import TraitSelectView from './TraitSelectView';
import TraitCheckboxView from './TraitCheckboxView';
import TraitNumberView from './TraitNumberView';
import TraitColorView from './TraitColorView';
import TraitButtonView from './TraitButtonView';

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
    this.render();
  }
});
