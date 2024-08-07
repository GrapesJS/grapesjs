import { AddOptions as _AddOptions } from 'backbone';
import { Collection } from '../../common';
import { DataRecordProps } from '../types';
import DataRecord from './DataRecord';
import DataSource from './DataSource';

type AddOptions = _AddOptions & { avoidTransformers?: boolean };

export default class DataRecords extends Collection<DataRecord> {
  dataSource: DataSource;

  constructor(models: DataRecord[] | DataRecordProps[], options: { dataSource: DataSource }) {
    super(models, options);
    this.dataSource = options.dataSource;
  }

  add(model: {} | DataRecord<DataRecordProps>, options?: AddOptions): DataRecord<DataRecordProps>;
  add(models: ({} | DataRecord<DataRecordProps>)[], options?: AddOptions): DataRecord<DataRecordProps>[];
  add(models: unknown, options?: AddOptions): DataRecord<DataRecordProps> | DataRecord<DataRecordProps>[] {
    const onRecordInsert = this.dataSource?.transformers?.onRecordInsert;

    if (options?.avoidTransformers) {
      return super.add(models as DataRecord<DataRecordProps>, options);
    }

    if (onRecordInsert) {
      const m = (Array.isArray(models) ? models : [models]).map(onRecordInsert);

      return super.add(m, options);
    } else {
      return super.add(models as DataRecord<DataRecordProps>, options);
    }
  }
}

DataRecords.prototype.model = DataRecord;
