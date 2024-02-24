import { Model } from '../../common';
import { DataSourceProps } from '../types';
import { DataRecords } from './DataRecords';

export class DataSource extends Model<DataSourceProps> {
  defaults() {
    return {
      records: [],
    };
  }

  get records() {
    return this.attributes.records as DataRecords;
  }
}
