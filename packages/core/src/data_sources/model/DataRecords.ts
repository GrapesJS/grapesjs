import { Collection } from '../../common';
import { DataRecordProps } from '../types';
import DataRecord from './DataRecord';
import DataSource from './DataSource';

export default class DataRecords<T extends DataRecordProps = DataRecordProps> extends Collection<DataRecord<T>> {
  dataSource: DataSource;

  constructor(models: DataRecord[] | DataRecordProps[], options: { dataSource: DataSource }) {
    super(models, options);
    this.dataSource = options.dataSource;
  }

  getRecord(id: string | number): DataRecord<T> | undefined {
    return this.get(id) || this.getRecordByIndex(id);
  }

  isIndexKey(id: string | number) {
    return !this.get(id) && !!this.getRecordByIndex(id);
  }

  private getRecordByIndex(id: string | number) {
    const index = this.getIndex(id);
    return index === undefined ? undefined : this.at(index);
  }

  private getIndex(id: string | number) {
    const index = typeof id === 'number' ? id : Number(id);
    return Number.isInteger(index) && `${index}` === `${id}` && index >= 0 ? index : undefined;
  }
}

DataRecords.prototype.model = DataRecord;
