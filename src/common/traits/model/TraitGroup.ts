import { isObject } from 'underscore';
import { InputProperties, InputViewProperties } from '..';
import { Model } from '../..';
import Trait, { TraitProperties } from './Trait';
import TraitGroupItem, { ParentTrait } from './TraitGroupItem';

export interface TraitListProperties extends TraitProperties {
  traits: any[];
}

export default class TraitGroup extends Trait<{ [name: string]: any }> implements ParentTrait<any> {
  readonly parent: ParentTrait<any>;
  templates: (InputProperties & InputViewProperties)[];

  get traits(): TraitGroupItem[] {
    const { value } = this;
    return this.templates.map(tr => new TraitGroupItem(tr.name, this, { ...tr, value: value[tr.name] }));
  }

  constructor(name: string, parent: ParentTrait<any>, opts: TraitListProperties) {
    super({ ...opts, name, changeProp: true } as any);
    this.parent = parent;
    this.templates = opts.traits ?? [{ type: 'text' }];
    if (!isObject(parent.getParentValue(name))) {
      parent.setParentValue(name, {});
    }
    console.log(this.value);
  }
  getParentValue(name: string) {
    return this.value[name];
  }
  setParentValue(name: string, value: any): void {
    this.value = { ...this.value, [name]: value };
    console.log('group setvalue');
  }

  protected getValue(): { [name: string]: any } {
    const { parent, name } = this;
    console.log(name);
    return parent.getParentValue(name);
  }

  protected setValue(values: { [name: string]: any }) {
    const { name, parent } = this;
    parent.setParentValue(name, values);
  }
}
