import { Collection } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { DataSourceProps } from '../types';
import { DataSource } from './DataSource';

export class DataSources extends Collection<DataSource> {
  em: EditorModel;

  constructor(models: DataSource[] | DataSourceProps[], em: EditorModel) {
    super(models, em);
    this.em = em;
  }
}
