import { TraitView } from '..';
import { View } from '../..';

export default class TraitsView extends View {
  inputs: TraitView[];
  constructor(inputs?: TraitView[], el?: any) {
    super({ el });
    this.inputs = inputs ?? [];
  }

  add(input: TraitView) {
    this.inputs.push(input);
  }

  clean() {
    this.inputs = [];
  }

  render() {
    var frag = document.createDocumentFragment();
    this.$el.empty();

    if (this.inputs.length) {
      this.inputs.forEach(view => {
        const rendered = view.render().el;
        frag.appendChild(rendered);
      });
    }

    this.$el.append(frag);
    return this;
  }
}
