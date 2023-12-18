import { Model } from '../..';
import Trait, { TraitProperties } from './Trait';

export interface TraitItemProperties extends TraitProperties {
  prefix: string;
}

export default class TraitItem<TModel extends Model = Model, TraitValueType = any> extends Trait<
  TModel,
  TraitValueType
> {
  readonly prefix: string;
  constructor(name: string, model: TModel, opts: any) {
    super(name, model, opts);
    this.prefix = opts.prefix;
  }

  public get value(): TraitValueType {
    const { prefix, model, name } = this;
    const value = model.get(prefix)[name];
    return value ?? this.opts.default;
  }
  public set value(value: TraitValueType) {
    const { name, model, prefix } = this;
    this.updatingValue = true;
    model.set(prefix, { ...model.get(prefix), [name]: value });
    this.updatingValue = false;
  }
}
