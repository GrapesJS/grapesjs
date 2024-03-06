import { isArray, isObject } from 'underscore';
import { Model } from '../..';
import Trait, { OnUpdateView, TraitProperties } from './Trait';
import TraitFactory from './TraitFactory';
import TraitRoot from './TraitRoot';

export default class TraitObjectItem<TraitValueType extends { [id: string]: any } = any> extends Trait<any> {
  target: Trait<TraitValueType>;
  onValueChange?: (value: any) => void;
  _name: string;
  get name(): string {
    return this._name;
  }
  constructor(name: string, target: Trait<TraitValueType>, opts: any, onValueChange?: (value: any) => void) {
    super(opts);
    this.target = target;
    this._name = name;
    console.log(this.value);
    if (!isObject(this.target.value)) {
      this.target.value = {} as TraitValueType;
    }
    this.onValueChange = onValueChange;
    // this.value = this.value;
  }

  get em() {
    return this.target.em;
  }

  protected getValue(): any {
    const { name } = this;
    return this.target.value[name as keyof TraitValueType];
  }

  protected setValue(value: any): void {
    console.log('setValue', value);
    console.log('setValueTarget', this.target);
    const { name } = this;
    const values = { ...this.target.value, [name]: value };
    this.target.value = values;
    this.onValueChange && this.onValueChange(values);

    // this.target.onUpdateEvent()
  }
}
