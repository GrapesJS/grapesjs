import { ItemManagerModule, ModuleConfig } from '../abstract/Module';
import { AddOptions, ObjectAny, RemoveOptions } from '../common';
import EditorModel from '../editor/model/Editor';
import { get, stringToPath } from '../utils/mixins';
import DataRecord from './model/DataRecord';
import DataSource from './model/DataSource';
import DataSources from './model/DataSources';
import { DataSourceProps, DataSourcesEvents } from './types';

export default class DataSourceManager extends ItemManagerModule<ModuleConfig, DataSources> {
  storageKey = '';
  events = DataSourcesEvents;
  destroy(): void {}

  constructor(em: EditorModel) {
    super(em, 'DataSources', new DataSources([], em), DataSourcesEvents);
  }

  /**
   * Add new data source.
   * @param {Object} props Data source properties.
   * @returns {[DataSource]} Added data source.
   * @example
   * const ds = dsm.add({
   *  id: 'my_data_source_id',
   *  records: [
   *    { id: 'id1', name: 'value1' },
   *    { id: 'id2', name: 'value2' }
   *  ]
   * });
   */
  add(props: DataSourceProps, opts: AddOptions = {}) {
    const { all } = this;
    props.id = props.id || this._createId();
    return all.add(props, opts);
  }

  /**
   * Get data source.
   * @param {String} id Data source id.
   * @returns {[DataSource]} Data source.
   * @example
   * const ds = dsm.get('my_data_source_id');
   */
  get(id: string) {
    return this.all.get(id);
  }

  /**
   * Remove data source.
   * @param {String|[DataSource]} id Id of the data source.
   * @returns {[DataSource]} Removed data source.
   * @example
   * const removed = dsm.remove('DS_ID');
   */
  remove(id: string | DataSource, opts?: RemoveOptions) {
    return this.__remove(id, opts);
  }

  /**
   * Get value from data sources by key
   * @param {String} key Path to value.
   * @param {any} defValue
   * @returns {any}
   * const value = dsm.getValue('ds_id.record_id.propName', 'defaultValue');
   */
  getValue(key: string | string[], defValue: any) {
    return get(this.getContext(), key, defValue);
  }

  getContext() {
    return this.all.reduce((acc, ds) => {
      acc[ds.id] = ds.records.reduce((accR, dr, i) => {
        accR[i] = dr.attributes;
        accR[dr.id || i] = dr.attributes;
        return accR;
      }, {} as ObjectAny);
      return acc;
    }, {} as ObjectAny);
  }

  fromPath(path: string) {
    const result: [DataSource?, DataRecord?, string?] = [];
    const [dsId, drId, ...resPath] = stringToPath(path || '');
    const dataSource = this.get(dsId);
    const dataRecord = dataSource?.records.get(drId);
    dataSource && result.push(dataSource);

    if (dataRecord) {
      result.push(dataRecord);
      resPath.length && result.push(resPath.join('.'));
    }

    return result;
  }
}
