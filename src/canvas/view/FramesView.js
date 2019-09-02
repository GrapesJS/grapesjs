import DomainViews from 'domain_abstract/view/DomainViews';
import FrameView from './FrameView';

export default DomainViews.extend({
  itemView: FrameView,

  init() {
    this.listenTo(this.collection, 'reset', this.render);
  },

  onRender() {
    const { config, $el } = this;
    const { em } = config;
    em && $el.attr({ class: `${em.getConfig('stylePrefix')}frames` });
  }
});
