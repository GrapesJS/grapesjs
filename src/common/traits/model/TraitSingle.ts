import { Model } from '../..';
import Trait, { TraitProperties } from './Trait';

export default class TraitSingle<TModel extends Model = Model, TraitValueType = any> extends Trait<TraitValueType> {
  readonly model: TModel;

  constructor(name: string, model: TModel, opts: any) {
    super({ ...opts, name });
    model.on('change:' + name, this.setValueFromModel, this);
    this.model = model;
  }

  protected getValue(): TraitValueType {
    const { changeProp, model, name } = this;
    const value = changeProp
      ? model.get(name)
      : // TODO update post component update
        model.get('attributes')[name];

    return value;
  }
  protected setValue(value: TraitValueType): void {
    const { name, model, changeProp } = this;

    if (changeProp) {
      model.set(name, value);
    } else {
      model.set('attributes', { ...model.get('attributes'), [name]: value });
    }
  }
}
