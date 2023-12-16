import { TraitView } from '..';
import { View } from '../..';

export default class TraitViewList extends View {
  inputs: TraitView[];
  constructor(inputs?: TraitView[], el?: any) {
    super({ el });
    this.inputs = inputs ?? [];
    console.log(this.inputs);
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
        console.log(rendered);
        frag.appendChild(rendered);
      });
    }
    console.log(frag);

    this.$el.append(frag);
    return this;
  }
}
