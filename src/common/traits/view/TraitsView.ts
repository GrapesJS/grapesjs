import InputFactory from '..';
import EditorModel from '../../../editor/model/Editor';
import Trait from '../model/Trait';
import TraitView, { TraitViewOpts } from './TraitView';

export interface TraitsViewOpts extends TraitViewOpts<'object'> {
  traits: Trait[];
}

export default class TraitsView extends TraitView {
  type = 'list';
  traits: Trait[];
  constructor(em: EditorModel, opts: TraitsViewOpts) {
    super(em, { ...opts });
    console.log(opts);
    this.traits = opts.traits ?? [];
  }

  onUpdateEvent(value: any): void {
    this.render();
  }

  render() {
    var frag = document.createDocumentFragment();
    this.$el.empty();

    if (this.traits.length) {
      this.traits.forEach(tr => {
        console.log('Building view');
        console.log(tr.opts);
        const view = InputFactory.buildView(tr, this.em, tr.opts);
        const rendered = view.render().el;
        frag.appendChild(rendered);
      });
    }

    this.$el.append(frag);
    this.setElement(this.el);
    return this;
  }
}
