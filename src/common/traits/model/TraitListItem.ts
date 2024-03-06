import { any, isArray } from 'underscore';
import { Model } from '../..';
import Trait, { TraitProperties } from './Trait';
import TraitFactory from './TraitFactory';

export default class TraitListItem extends Trait<any[]> {
  target: Trait<any[]>;
  public readonly index: number;
  public get name() {
    return this.index + '';
  }
  // traits: (TraitGroupItem|TraitGroup)[];
  constructor(index: number, target: Trait<any[]>, opts: TraitProperties) {
    super({ ...opts, changeProp: true } as any);
    this.index = index;
    this.target = target;
    if (!isArray(this.target.value)) {
      this.target.value = [];
    }

    //   this.traits = []
    console.log('alamr', this.target.value);
  }

  get traits() {
    return this.value.map(v => this.initTrait(v.id, v.value));
  }

  private initTrait(index: string, value?: any) {
    const { templates } = this;
    const traits = this.templates;
    // console.log(this.traits)
    // const index = this.traits.length as any
    // if (isArray(templates) && templates.length > 1) {
    //   return new TraitGroup(index, this, { name: index, traits, value });
    // } else {
    //   return new TraitGroupItem(index, this, { ...traits, value });
    // }
  }

  get em() {
    return this.target.em;
  }

  protected getValue(): any {
    const { index } = this;
    return this.target.value[index];
  }

  protected setValue(value: any): void {
    const { index } = this;
    const values = this.target.value; //, [this.index]: value];
    values[index] = value;
    this.target.value = values;
    this.target.onUpdateEvent();
  }

  //   public add() {
  //     this.setValue([...this.value, { id: this.value.length + '', value: '' }]);
  //     // this.model.trigger(`change:${this.name}`);
  //   }

  //   public remove(id: string) {
  //     const { value } = this;
  //     const index = value?.findIndex(tr => tr.id == id) ?? -1;
  //     if (index > -1) {
  //       value.splice(index, 1);
  //     }
  //     this.setValue(value);
  //   }
}
