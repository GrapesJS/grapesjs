import { keys } from 'underscore';
import { Collection, Model } from '../../common';
import { DataRecordProps } from '../types';

export class DataRecord<T extends DataRecordProps = DataRecordProps> extends Model<T> {
  // collection?: Collection<T>;

  constructor(props: T, opts = {}) {
    super(props, opts);
    this.on('change', dr => {
      const changed = dr.changedAttributes();
      keys(changed).forEach(prop => {
        const eventKey = `${this.dataSource.id}.${this.id}.${prop}`;
        console.log('changed', eventKey);
        // em.trigger(eventKey);
      });
    });
  }

  get dataSource() {
    return (this.collection as any).dataSource;
  }
}
