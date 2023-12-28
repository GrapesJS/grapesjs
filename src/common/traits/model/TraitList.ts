import { any, isArray } from 'underscore';
import { InputProperties, InputViewProperties } from '..';
import { Model } from '../..';
import Trait, { TraitProperties } from './Trait';
import TraitGroup from './TraitGroup';
import TraitGroupItem, { ParentTrait } from './TraitGroupItem';

export interface TraitListProperties extends TraitProperties {
  traits: any[] | any;
  default?: any[];
}

export default class TraitList<TModel extends Model = Model>
  extends Trait<{ id: string; value: any }[]>
  implements ParentTrait<any>
{
  readonly model: TModel;
  templates: any[] | any;
  // traits: (TraitGroupItem|TraitGroup)[];
  constructor(name: string, model: TModel, opts: TraitListProperties) {
    super({ ...opts, type: 'list', name, changeProp: true } as any);
    model.on('change:' + name, this.setValueFromModel, this);
    this.model = model;
    // this.model.on("all", (e) => console.log(e))
    // this.traits = opts?.traits ?? [{type: "list"}]
    model.get(name) ?? model.set(name, [], { silent: true });
    // this.value= model.get("values")
    this.templates = opts.traits;

    //   this.traits = []

    //   this.value.forEach(v => this.traits.push(this.initTrait(v)))
  }
  get traits() {
    return this.value.map(v => this.initTrait(v.id, v.value));
  }

  getParentValue(name: string) {
    return this.value.find(item => item.id == name)?.value;
  }

  setParentValue(name: string, value: any): void {
    let values = this.value;
    const index = values.findIndex(item => item.id == name);
    values[index] = { id: name, value };
    this.value = values;
  }

  private initTrait(index: string, value?: any) {
    const { templates } = this;
    const traits = this.templates;
    // console.log(this.traits)
    // const index = this.traits.length as any
    if (isArray(templates) && templates.length > 1) {
      return new TraitGroup(index, this, { name: index, traits, value });
    } else {
      return new TraitGroupItem(index, this, { ...traits, value });
    }
  }

  protected getValue(): { id: string; value: any }[] {
    const { model, name } = this;
    return model.get(name).map((value: any, id: number) => ({ id: id + '', value }));
  }

  protected setValue(values: { id: string; value: any }[]) {
    const { name, model } = this;

    model.set(
      name,
      values.map(item => item.value)
    );
  }

  public add() {
    this.setValue([...this.value, { id: this.value.length + '', value: '' }]);
    this.model.trigger(`change:${this.name}`);
  }

  public remove(id: string) {
    const { value } = this;
    const index = value?.findIndex(tr => tr.id == id) ?? -1;
    if (index > -1) {
      value.splice(index, 1);
    }
    this.setValue(value);
  }
}
