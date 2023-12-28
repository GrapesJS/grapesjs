import { Model } from '../..';
import Trait, { TraitProperties } from './Trait';

// export interface TraitItemProperties<TModel extends Model = Model,TraitValueType = any> extends TraitProperties {
//   getValues: (model: TModel) => {[key: string]: TraitValueType};
//   setValues: (model: TModel, updatedValues: {[key: string]: TraitValueType}) => void;
// }
export interface ParentTrait<TraitValueType = any> {
  getParentValue(name: string): TraitValueType;
  setParentValue(name: string, value: TraitValueType): void;
}

export default class TraitGroupItem<TraitValueType = any> extends Trait<TraitValueType> {
  // opts: TraitItemProperties<TModel, TraitValueType>
  parent: ParentTrait<TraitValueType>;
  constructor(name: string, parent: ParentTrait<TraitValueType>, opts: TraitProperties) {
    super({ ...opts, name });
    // this.opts = opts;

    this.parent = parent;
  }

  protected getValue(): TraitValueType {
    const { name } = this;
    console.log('getValues');
    const value = this.parent.getParentValue(name);
    return value ?? this.opts.default;
  }
  protected setValue(value: TraitValueType) {
    const { parent, name } = this;
    console.log('TraitGroupItem:setValues');
    parent.setParentValue(name, value);
  }
}
