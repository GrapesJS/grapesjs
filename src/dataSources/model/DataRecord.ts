import { keys } from 'underscore';
import { Model } from '../../common';
import { DataRecordProps, DataSourcesEvents } from '../types';
import DataRecords from './DataRecords';

export default class DataRecord<T extends DataRecordProps = DataRecordProps> extends Model<T> {
  constructor(props: T, opts = {}) {
    super(props, opts);
    this.on('change', this.handleChange);
  }

  get cl() {
    return this.collection as unknown as DataRecords;
  }

  get dataSource() {
    return this.cl.dataSource;
  }

  get em() {
    return this.dataSource.em;
  }

  get index(): number {
    return this.cl.indexOf(this);
  }

  handleChange() {
    const changed = this.changedAttributes();
    keys(changed).forEach(prop => this.triggerChange(prop));
  }

  /**
   * Get path of the record
   * @param {String} prop Property name to include
   * @returns {String}
   * @example
   * const pathRecord = record.getPath();
   * // eg. 'SOURCE_ID.RECORD_ID'
   * const pathRecord2 = record.getPath('myProp');
   * // eg. 'SOURCE_ID.RECORD_ID.myProp'
   */
  getPath(prop?: string, opts: { useIndex?: boolean } = {}) {
    const { dataSource, id, index } = this;
    const dsId = dataSource.id;
    const suffix = prop ? `.${prop}` : '';
    return `${dsId}.${opts.useIndex ? index : id}${suffix}`;
  }

  getPaths(prop?: string) {
    return [this.getPath(prop), this.getPath(prop, { useIndex: true })];
  }

  triggerChange(prop?: string) {
    const { dataSource, em } = this;
    const data = { dataSource, dataRecord: this };
    const paths = this.getPaths(prop);
    paths.forEach(path => em.trigger(`${DataSourcesEvents.path}:${path}`, { ...data, path }));
  }
}
