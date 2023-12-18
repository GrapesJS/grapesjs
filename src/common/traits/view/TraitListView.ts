import { isString } from 'underscore';
import TraitView from './TraitView';
import { Model } from '../..';
import EditorModel from '../../../editor/model/Editor';
import TraitList, { TraitListProperties } from '../model/TraitList';
import { TraitViewOpts } from './TraitView';
import InputFactory from '..';

export interface TraitListViewOpts extends TraitViewOpts {
  default?: any;
  name?: string;
  label?: string;
  paceholder?: string;
  noLabel?: boolean;
}

export default class TraitListView<TModel extends Model = Model> extends TraitView<TraitList<TModel>> {
  protected type = 'list';

  get inputValue(): any {
    return this.target.value;
  }
  set inputValue(value: any) {}
  constructor(em: EditorModel, opts?: TraitListViewOpts) {
    super(em, opts);
  }

  setTarget(popertyName: string, model: TModel, opts?: TraitListProperties): this;
  setTarget(target: TraitList<TModel>): this;
  setTarget(target: unknown, model?: TModel, opts?: TraitListProperties) {
    if (isString(target) && model !== undefined) {
      target = new TraitList(target, model, opts);
    }
    this.target = target as TraitList<TModel>;
    this.model = this.target.model as any;
    this.name ?? (this.name = this.target.name);
    this.target.registerForUpdateEvent(this);
    return this;
  }

  render() {
    const { em } = this;
    var frag = document.createDocumentFragment();
    this.$el.empty();

    if (this.target.value.length) {
      this.target.value.forEach(view => {
        const rendered = InputFactory.buildView(view, em, view.opts).render().el;
        console.log(rendered);
        frag.appendChild(rendered);
      });
    }
    console.log(frag);

    this.$el.append(frag);
    return this;
  }
}
