import { AddOptions, CombinedModelConstructorOptions, Model, RemoveOptions } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { DataRecordProps, DataSourceProps, DataSourceTransformers } from '../types';
import DataRecord from './DataRecord';
import DataRecords from './DataRecords';
import DataSources from './DataSources';

interface DataSourceOptions extends CombinedModelConstructorOptions<{ em: EditorModel }, DataSource> {}

export default class DataSource extends Model<DataSourceProps> {
  transformers: DataSourceTransformers;

  defaults() {
    return {
      records: [],
      transformers: {},
    };
  }

  constructor(props: DataSourceProps, opts: DataSourceOptions) {
    super(props, opts);
    const { records, transformers } = props;
    this.transformers = transformers || {};

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
    const onRecordInsert = this.transformers.onRecordInsert;
    if (onRecordInsert) {
      record = onRecordInsert(record);
    }

    return this.records.add(record, opts);
  }

  getRecord(id: string | number): DataRecord | undefined {
    return this.records.get(id);
  }

  getRecords() {
    return [...this.records.models];
  }

  removeRecord(id: string | number, opts?: RemoveOptions): DataRecord | undefined {
    return this.records.remove(id, opts);
  }
}
