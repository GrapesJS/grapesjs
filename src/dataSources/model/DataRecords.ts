import { Collection } from '../../common';
import { DataRecordProps } from '../types';
import { DataRecord } from './DataRecord';
import { DataSource } from './DataSource';

export class DataRecords extends Collection<DataRecord> {
  dataSource: DataSource;

  constructor(models: DataRecord[] | Array<DataRecordProps>, options: { dataSource: DataSource }) {
    super(models, options);
    this.dataSource = options.dataSource;
  }
}

DataRecords.prototype.model = DataRecord;
