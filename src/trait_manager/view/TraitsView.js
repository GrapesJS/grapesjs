import DomainViews from '../../domain_abstract/view/DomainViews';
import TraitView from './TraitView';

export default class TraitsView extends DomainViews {
  reuseView = true;

  constructor(o = {}, itemsView) {
    super(o);
    this.itemsView = itemsView;
    const config = o.config || {};
    const pfx = config.stylePrefix || '';
    const em = o.editor;
    this.config = config;
    this.em = em;
    this.pfx = pfx;
    this.ppfx = config.pStylePrefix || '';
    this.className = `${pfx}traits`;
    this.listenTo(em, 'component:toggled', this.updatedCollection);
    this.updatedCollection();
  }

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
}

TraitsView.prototype.itemView = TraitView;
