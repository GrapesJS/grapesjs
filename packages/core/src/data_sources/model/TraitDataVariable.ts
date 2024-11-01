import DataVariable, { DataVariableDefinition } from './DataVariable';
import Trait from '../../trait_manager/model/Trait';
import { TraitProperties } from '../../trait_manager/types';

export type TraitDataVariableDefinition = TraitProperties & DataVariableDefinition;

export default class TraitDataVariable extends DataVariable {
  trait?: Trait;

  constructor(attrs: TraitDataVariableDefinition, options: any) {
    super(attrs, options);
    this.trait = options.trait;
  }

  onDataSourceChange() {
    const newValue = this.getDataValue();
    this.trait?.setTargetValue(newValue);
  }
}
