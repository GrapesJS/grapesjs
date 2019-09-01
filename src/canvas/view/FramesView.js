import DomainViews from 'domain_abstract/view/DomainViews';
import FrameView from './FrameView';

export default DomainViews.extend({
  itemView: FrameView,

  initialize(opts) {
    this.config = { editor: opts.editor || '' };
    this.listenTo(this.collection, 'reset', this.render);
  }
});
