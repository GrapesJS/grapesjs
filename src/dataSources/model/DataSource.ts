import { Collection } from 'backbone';
import { CombinedModelConstructorOptions, Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { DataSourceProps } from '../types';
import { DataRecords } from './DataRecords';
import { DataSources } from './DataSources';

interface DataSourceOptions extends CombinedModelConstructorOptions<{ em: EditorModel }, DataSource> {}

export class DataSource extends Model<DataSourceProps> {
  defaults() {
    return {
      records: [],
    };
  }

  constructor(props: DataSourceProps, opts: DataSourceOptions) {
    super(props, opts);
    const { records } = props;

    if (!(records instanceof DataRecords)) {
      this.set({ records: new DataRecords(records!, { dataSource: this }) });
    }

    console.log('DataSource.constructor', { props, records: this.records, opts, coll: this.collection });
  }

  get records() {
    return this.attributes.records as DataRecords;
  }

  get em() {
    return (this.collection as unknown as DataSources).em;
  }
}
