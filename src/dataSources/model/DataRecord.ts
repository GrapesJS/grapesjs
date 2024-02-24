import { keys } from 'underscore';
import { Model } from '../../common';
import { DataRecordProps } from '../types';
import { DataRecords } from './DataRecords';

export class DataRecord<T extends DataRecordProps = DataRecordProps> extends Model<T> {
  constructor(props: T, opts = {}) {
    super(props, opts);
    this.on('change', (dr: DataRecord) => {
      const { id, em } = this.dataSource;

      const changed = dr.changedAttributes();
      keys(changed).forEach(prop => {
        const path = this.getPath(prop);
        console.log('TODO change to data:path:DS_ID.DR_ID.KEY ', path);
        em.trigger(path);
      });
    });
  }

  get dataSource() {
    return (this.collection as unknown as DataRecords).dataSource;
  }

  getPath(prop?: string) {
    const { dataSource, id } = this;
    const dsId = dataSource.id;
    const suffix = prop ? `.${prop}` : '';
    return `${dsId}.${id}${suffix}`;
  }
}
