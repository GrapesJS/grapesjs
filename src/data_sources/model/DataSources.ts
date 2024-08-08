import { Collection } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { DataSourceProps } from '../types';
import DataSource from './DataSource';

export default class DataSources extends Collection<DataSource> {
  em: EditorModel;

  constructor(models: DataSource[] | DataSourceProps[], em: EditorModel) {
    super(models, em);
    this.em = em;

    // @ts-ignore We need to inject `em` for pages created on reset from the Storage load
    this.model = (props: DataSourceProps, opts = {}) => {
      return new DataSource(props, { ...opts, em });
    };
  }
}
