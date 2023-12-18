import { InputProperties, InputViewProperties } from '..';
import { Model } from '../..';
import Trait, { TraitProperties } from './Trait';
import TraitItem from './TraitItem';

export interface TraitListProperties extends TraitProperties {
  default?: any;
  value?: any;
}

export default class TraitList<TModel extends Model = Model> extends Trait<TModel, Trait[]> {
  // traits: (InputViewProperties) []
  collection?: Trait[];
  constructor(name: string, model: TModel, opts?: TraitListProperties) {
    super(name, model, { ...opts, type: 'list', changeProp: true } as any);
    // this.model.on("all", (e) => console.log(e))
    // this.traits = opts?.traits ?? [{type: "list"}]
    model.get(name) ?? model.set(name, {});
  }

  protected setValueFromModel() {
    this.collection = undefined;
    if (!this.updatingValue) {
      this.view?.onUpdateEvent(this.value);
    }
  }

  public get value(): Trait[] {
    const { model, name } = this;
    if (!this.collection) {
      const map = model.get(name);
      this.collection = Object.keys(map).map(
        key => new TraitItem(key, model, { type: 'text', name: key, prefix: name, value: map[key] })
      );
    }
    return this.collection!;
  }

  public set value(values: Trait[]) {
    const { name, model } = this;
    this.updatingValue = true;

    model.set(
      name,
      values.reduce((map: any, tr) => {
        map[tr.name] = tr.value;
        return map;
      }, {})
    );
    this.updatingValue = false;
  }

  public add(key: string) {
    const { model, name } = this;
    if (!this.collection?.find(tr => tr.name == key)) {
      this.value.push(new TraitItem(key, model, { type: 'text', name: key, prefix: name }));
    }
  }

  public remove(key: string) {
    const index = this.collection?.findIndex(tr => tr.name == key) ?? -1;
    if (index > -1) {
      this.value.splice(index, 1);
    }
  }
}
