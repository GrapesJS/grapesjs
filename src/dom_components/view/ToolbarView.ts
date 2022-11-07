import DomainViews from '../../domain_abstract/view/DomainViews';
import ToolbarButtonView, { ToolbarViewProps } from './ToolbarButtonView';

export default class ToolbarView extends DomainViews {
  constructor(opts: ToolbarViewProps) {
    super(opts);
    this.config = { em: opts.em };
    this.listenTo(this.collection, 'reset', this.render);
  }
}

// @ts-ignore
ToolbarView.prototype.itemView = ToolbarButtonView;
