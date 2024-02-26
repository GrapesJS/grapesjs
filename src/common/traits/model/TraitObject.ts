import { isArray, isObject } from 'underscore';
import Trait, { OnUpdateView, TraitProperties } from './Trait';
import TraitFactory from './TraitFactory';
import TraitModifier from './TraitModifier';
import TraitObjectItem from './TraitObjectItem';

export default class TraitObject<TraitValueType extends { [id: string]: any } = any> extends TraitModifier<{
  [id: string]: any;
}> {
  private readonly _name;

  constructor(target: Trait<TraitValueType>) {
    target.opts.changeProp = true;
    super(target);
    this._name = target.name;

    if (!isObject(this.target.value)) {
      this.value = {} as TraitValueType;
    }
    // this.overrideValue = target.opts.overrideValue
  }
  get name(): string {
    return this._name;
  }

  protected initChildren() {
    return (this.target.templates as any[])?.map(tr => {
      return TraitFactory.buildNestedTraits(new TraitObjectItem(tr.name, this, tr));
    });
  }

  protected overrideValue(value: TraitValueType) {
    return value;
  }

  get viewType() {
    return 'object';
  }

  get editable(): boolean {
    return this.opts.editable ?? true;
  }
}
