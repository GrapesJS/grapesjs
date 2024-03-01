import { AddOptions, CombinedModelConstructorOptions, Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { DataRecordProps, DataSourceProps } from '../types';
import DataRecord from './DataRecord';
import DataRecords from './DataRecords';
import DataSources from './DataSources';

interface DataSourceOptions extends CombinedModelConstructorOptions<{ em: EditorModel }, DataSource> {}

export default class DataSource extends Model<DataSourceProps> {
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

    this.listenTo(this.records, 'add', this.onAdd);
  }

  get records() {
    return this.attributes.records as DataRecords;
  }

  get em() {
    return (this.collection as unknown as DataSources).em;
  }

  onAdd(dr: DataRecord) {
    dr.triggerChange();
  }

  addRecord(record: DataRecordProps, opts?: AddOptions) {
    return this.records.add(record, opts);
  }

  getRecord(id: string | number): DataRecord | undefined {
    return this.records.get(id);
  }

  getRecords() {
    return [...this.records.models];
  }
}
