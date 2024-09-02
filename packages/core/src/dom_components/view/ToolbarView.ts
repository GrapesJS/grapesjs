import DomainViews from '../../domain_abstract/view/DomainViews';
import EditorModel from '../../editor/model/Editor';
import ToolbarButtonView, { ToolbarViewProps } from './ToolbarButtonView';

export default class ToolbarView extends DomainViews {
  em: EditorModel;

  constructor(opts: ToolbarViewProps) {
    super(opts);
    const { em } = opts;
    this.em = em;
    this.config = { em };
    this.listenTo(this.collection, 'reset', this.render);
  }

  onRender() {
    const pfx = this.em.config.stylePrefix!;
    this.el.className = `${pfx}toolbar-items`;
  }
}

// @ts-ignore
ToolbarView.prototype.itemView = ToolbarButtonView;
