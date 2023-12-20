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

export default class TraitList<TModel extends Model = Model> extends Trait<any[]> implements ParentTrait<any> {
  readonly model: TModel;
  templates: any[] | any;
  // traits: (TraitGroupItem|TraitGroup)[];
  constructor(name: string, model: TModel, opts: TraitListProperties) {
    super({ ...opts, type: 'list', name, changeProp: true } as any);
    model.on('change:' + name, this.setValueFromModel, this);
    this.model = model;
    // this.model.on("all", (e) => console.log(e))
    // this.traits = opts?.traits ?? [{type: "list"}]
    model.get(name) ?? model.set(name, []);
    // this.value= model.get("values")
    this.templates = opts.traits;

    //   this.traits = []

    //   this.value.forEach(v => this.traits.push(this.initTrait(v)))
  }
  get traits() {
    return this.value.map((v, index) => this.initTrait(v, index + ''));
  }
  getParentValue(name: string) {
    return this.value[name as any];
  }
  setParentValue(name: string, value: any): void {
    let values = this.value;
    values[name as any] = value;
    this.value = values;
    console.log('setvalue');
  }

  private initTrait(value?: any, index?: any) {
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

  protected getValue(): any[] {
    const { model, name } = this;
    return model.get(name);
  }

  protected setValue(values: any[]) {
    const { name, model } = this;
    console.log('setValue');

    model.set(name, values);
  }

  public add(key: string) {
    const { model, name } = this;
    this.value.push('');
    model.trigger(`change:${name}`);
  }

  public remove(key: string) {
    const index = this.traits?.findIndex(tr => tr.name == key) ?? -1;
    //   if (index > -1) {
    //     this.value.splice(index, 1);
    //   }
  }
}
