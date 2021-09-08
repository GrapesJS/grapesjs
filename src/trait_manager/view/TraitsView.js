import DomainViews from 'domain_abstract/view/DomainViews';
import TraitView from './TraitView';

export default DomainViews.extend({
  ns: 'Traits',
  itemView: TraitView,
  reuseView: 1,

  initialize(o = {}) {
    const config = o.config || {};
    const pfx = config.stylePrefix || '';
    const em = o.editor;
    this.config = config;
    this.em = em;
    this.pfx = pfx;
    this.ppfx = config.pStylePrefix || '';
    this.className = `${pfx}traits`;
    this.listenTo(em, 'component:toggled', this.updatedCollection);
  },

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    const { ppfx, className, em } = this;
    const comp = em.getSelected();
    this.el.className = `${className} ${ppfx}one-bg ${ppfx}two-color`;
    this.collection = comp ? comp.get('traits') : [];
    this.render();
  }
});
