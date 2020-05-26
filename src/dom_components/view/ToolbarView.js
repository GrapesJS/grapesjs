import DomainViews from 'domain_abstract/view/DomainViews';
import ToolbarButtonView from './ToolbarButtonView';

export default DomainViews.extend({
  itemView: ToolbarButtonView,

  initialize(opts = {}) {
    this.config = { editor: opts.editor || '', em: opts.em };
    this.listenTo(this.collection, 'reset', this.render);
  }
});
