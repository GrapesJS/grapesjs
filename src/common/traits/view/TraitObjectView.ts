import { any, isArray, isObject } from 'underscore';
import InputFactory from '..';
import EditorModel from '../../../editor/model/Editor';
import Trait from '../model/Trait';
import TraitListItem from '../model/TraitListItem';
import TraitObject from '../model/TraitObject';
import TraitObjectItem from '../model/TraitObjectItem';
import TraitsView from './TraitsView';
import TraitView, { TraitViewOpts } from './TraitView';

export default class TraitObjectView extends TraitsView<TraitObject> {
  type = 'object';
  template: any;
  constructor(em: EditorModel, opts: TraitViewOpts<'object'>) {
    super(em, { ...opts } as any);
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

  // onUpdateEvent(value: any, fromTarget: boolean): void {
  //   if (fromTarget) {
  //     console.log("setValueFromModelChildren5", this)
  //     console.log("setValueFromModelChildren", this.target?.children)
  //     this.render();
  //   }
  // }

  renderTraits(traits: TraitView[]) {
    const { ppfx, className, getLabelText } = this;
    var frag = document.createDocumentFragment();

    let index = 0;
    var lineFrag: HTMLDivElement | undefined;
    traits.forEach(tr => {
      const width = (tr.target.opts.width && parseInt(tr.target.opts.width)) ?? 100;
      index += width;
      let view;
      if (width < 100) {
        const divider = document.createElement('div');
        divider.style.width = `${width}%`;
        divider.style.display = 'inline-block';
        divider.append(tr.$el.get(0)!);
        view = divider;
      } else {
        view = tr.$el.get(0)!;
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

    this.$el.empty().append(frag);
    this.$el.addClass(`${className} ${ppfx}one-bg ${ppfx}two-color`);
    console.log('setValueinitChildren', this.target);
    console.log('setValueFromModel5', this.$el.get(0));
    console.log('setValueFromModel5', this.el, this.target?.children);
    return this;
  }
}
