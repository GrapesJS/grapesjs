import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { get, stringToPath } from '../../utils/mixins';

export default class StyleDataVariable extends Model {
  em?: EditorModel;

  defaults() {
    return {
      type: 'data-variable-css',
      value: '',
      path: '',
    };
  }

  initialize(attrs: any, options: any) {
    super.initialize(attrs, options);
    this.em = options.em;
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

  onDataSourceChange(model: any) {
    const { path } = this.attributes;
    const newValue = get(model, stringToPath(path).join('.'), '');
    this.set({ value: newValue });
  }
}
