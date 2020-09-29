import DomainViews from 'domain_abstract/view/DomainViews';
import FrameWrapView from './FrameWrapView';

export default DomainViews.extend({
  itemView: FrameWrapView,
  autoAdd: 1,

  init() {
    this.listenTo(this.collection, 'reset', this.render);
  },

  onRender() {
    const { config, $el } = this;
    const { em } = config;
    em && $el.attr({ class: `${em.getConfig('stylePrefix')}frames` });
  }
});
