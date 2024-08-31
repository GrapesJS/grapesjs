import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { stringToPath } from '../../utils/mixins';

export const DataVariableType = 'data-variable';

export default class DataVariable extends Model {
  em?: EditorModel;

  defaults() {
    return {
      type: DataVariableType,
      defaultValue: '',
      path: '',
    };
  }

  constructor(attrs: any, options: any) {
    super(attrs, options);
    this.em = options.em;
    this.listenToDataSource();
  }

  listenToDataSource() {
    const { path } = this.attributes;
    const resolvedPath = stringToPath(path).join('.');

    if (this.em) {
      this.listenTo(this.em.DataSources, `change:${resolvedPath}`, this.onDataSourceChange);
    }
  }

  onDataSourceChange() {
    const newValue = this.getDataValue();
    this.set({ value: newValue });
  }

  getDataValue() {
    const { path, defaultValue } = this.attributes;
    const val = this.em?.DataSources?.getValue?.(path, defaultValue);

    return val;
  }
}
