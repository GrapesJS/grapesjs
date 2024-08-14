import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { stringToPath } from '../../utils/mixins';
import Trait from './Trait';

export default class TraitDataVariable extends Model {
  em?: EditorModel;
  trait?: Trait;

  defaults() {
    return {
      type: 'data-variable',
      value: '',
      path: '',
    };
  }

  initialize(attrs: any, options: any) {
    super.initialize(attrs, options);
    this.em = options.em;
    this.trait = options.trait;

    this.listenToDataSource();

    return this;
  }

  listenToDataSource() {
    const { path } = this.attributes;
    const resolvedPath = stringToPath(path).join('.');

    if (this.em) {
      this.listenTo(this.em.DataSources, `change:${resolvedPath}`, this.onDataSourceChange);
    }
  }

  getDataValue() {
    const { path } = this.attributes;
    const [dsId, drId, key] = stringToPath(path);
    const ds = this?.em?.DataSources.get(dsId);
    const dr = ds && ds.getRecord(drId);
    const dv = dr?.get(key);

    return dv;
  }

  onDataSourceChange() {
    const dv = this.getDataValue();
    this?.trait?.setTargetValue(dv);
  }
}
