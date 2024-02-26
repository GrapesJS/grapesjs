import { isArray, isObject } from 'underscore';
import InputFactory from '..';
import EditorModel from '../../../editor/model/Editor';
import Trait from '../model/Trait';
import TraitListItem from '../model/TraitListItem';
import TraitObjectItem from '../model/TraitObjectItem';
import TraitView, { TraitViewOpts } from './TraitView';

export default class TraitObjectView extends TraitView {
  type = 'object';
  template: any;
  constructor(em: EditorModel, opts: TraitViewOpts<'object'>) {
    super(em, { ...opts });
    this.className = `${this.pfx}traits`;
  }

  // initTarget(target: Trait){
  //   const { template } = this
  //   if(isArray(target.value)){
  //     this._traits = target.value.map(([value, index]) => new TraitList(index, this.target, {value, ...template}))
  //   }
  //   else if(isObject(target.value)){
  //     this._traits = Object.entries(target.value).map(([id, value]) => new TraitObject(id, this.target, {value, ...template}))
  //   }
  //   else{
  //     this._traits = []
  //   }
  //   console.log("alam",typeof target.value)
  //   console.log("alam",this.traits)
  // }

  onUpdateEvent(value: any, fromTarget: boolean): void {
    if (fromTarget) {
      this.render();
    }
  }

  protected renderItem(trait: Trait) {
    const { em } = this;
    const view = InputFactory.buildView(trait, em, trait.opts);
    trait.view = this;
    const rendered = view.render().$el;
    return rendered;
  }

  render(traits?: Trait[]) {
    const { ppfx, className, getLabelText } = this;
    var frag = document.createDocumentFragment();

    let index = 0;
    var lineFrag: HTMLDivElement | undefined;
    (traits ?? this.target.children).forEach(tr => {
      const rendered = this.renderItem(tr);
      const width = (tr.opts.width && parseInt(tr.opts.width)) ?? 100;
      index += width;
      let view;
      if (width < 100) {
        const divider = document.createElement('div');
        divider.style.width = `${width}%`;
        divider.style.display = 'inline-block';
        divider.append(rendered.get(0)!);
        view = divider;
      } else {
        view = rendered.get(0)!;
      }

      if (index > 100) {
        lineFrag && frag.appendChild(lineFrag);
        if (width == 100) {
          frag.appendChild(view);
          lineFrag = undefined;
          index = 0;
        } else {
          index = width;
          lineFrag = document.createElement('div');
          lineFrag.append(view);
        }
      } else if (index == 100) {
        frag.appendChild((lineFrag?.append(view) || lineFrag) ?? view);
        index = 0;
      } else if (index < 100) {
        lineFrag || (lineFrag = document.createElement('div'));
        lineFrag.append(view);
      }
      // frag.appendChild(rendered.get(0)!);
    });
    this.$el.empty().append().append(frag);
    this.$el.addClass(`${className} ${ppfx}one-bg ${ppfx}two-color`);

    return this;
  }
}
