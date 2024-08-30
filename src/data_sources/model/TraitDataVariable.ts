import DataVariable from './DataVariable';
import Trait from '../../trait_manager/model/Trait';

export default class TraitDataVariable extends DataVariable {
  trait?: Trait;

  constructor(attrs: any, options: any) {
    super(attrs, options);
    this.trait = options.trait;
  }

  onDataSourceChange() {
    const newValue = this.getDataValue();
    this.trait?.setTargetValue(newValue);
  }
}
