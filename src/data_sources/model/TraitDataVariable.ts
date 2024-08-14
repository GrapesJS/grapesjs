import DataVariable from './DataVariable';
import Trait from '../../trait_manager/model/Trait';

export default class TraitDataVariable extends DataVariable {
  trait?: Trait;

  initialize(attrs: any, options: any) {
    super.initialize(attrs, options);
    this.trait = options.trait;

    return this;
  }

  onDataSourceChange() {
    const newValue = this.getDataValue();
    this.trait?.setTargetValue(newValue);
  }
}
