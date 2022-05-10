import DomainViews from '../../domain_abstract/view/DomainViews';
import FrameWrapView from './FrameWrapView';

export default class FramesView extends DomainViews {
  constructor(opts = {}, config) {
    super(opts, config, true);
    this.listenTo(this.collection, 'reset', this.render);
  }

  onRemoveBefore(items, opts) {
    items.forEach(item => item.remove(opts));
  }

  onRender() {
    const { config, $el } = this;
    const { em } = config;
    em && $el.attr({ class: `${em.getConfig().stylePrefix}frames` });
  }
}

FramesView.prototype.itemView = FrameWrapView;
