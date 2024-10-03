/**
 * This module manages data sources within the editor.
 * You can initialize the module with the editor by passing an instance of `EditorModel`.
 *
 * ```js
 * const editor = new EditorModel();
 * const dsm = new DataSourceManager(editor);
 * ```
 *
 * Once the editor is instantiated, you can use the following API to manage data sources:
 *
 * ```js
 * const dsm = editor.DataSources;
 * ```
 *
 * * [add](#add) - Add a new data source.
 * * [get](#get) - Retrieve a data source by its ID.
 * * [getAll](#getall) - Retrieve all data sources.
 * * [remove](#remove) - Remove a data source by its ID.
 * * [clear](#clear) - Remove all data sources.
 *
 * Example of adding a data source:
 *
 * ```js
 * const ds = dsm.add({
 *   id: 'my_data_source_id',
 *   records: [
 *     { id: 'id1', name: 'value1' },
 *     { id: 'id2', name: 'value2' }
 *   ]
 * });
 * ```
 *
 * @module DataSources
 * @param {EditorModel} em - Editor model.
 */

import { ItemManagerModule, ModuleConfig } from '../abstract/Module';
import { AddOptions, ObjectAny, RemoveOptions } from '../common';
import EditorModel from '../editor/model/Editor';
import { get, stringToPath } from '../utils/mixins';
import DataRecord from './model/DataRecord';
import DataSource from './model/DataSource';
import DataSources from './model/DataSources';
import { DataSourcesEvents, DataSourceProps } from './types';
import { Events } from 'backbone';

export default class DataSourceManager extends ItemManagerModule<ModuleConfig, DataSources> {
  storageKey = 'dataSources';
  events = DataSourcesEvents;
  destroy(): void {}

  constructor(em: EditorModel) {
    super(em, 'DataSources', new DataSources([], em), DataSourcesEvents);
    Object.assign(this, Events); // Mixin Backbone.Events
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
   * Get value from data sources by key
   * @param {String} key Path to value.
   * @param {any} defValue
   * @returns {any}
   * const value = dsm.getValue('ds_id.record_id.propName', 'defaultValue');
   */
  getValue(key: string | string[], defValue: any) {
    return get(this.getContext(), key, defValue);
  }

  private getContext() {
    return this.all.reduce((acc, ds) => {
      acc[ds.id] = ds.records.reduce((accR, dr, i) => {
        const dataRecord = dr;

        accR[i] = dataRecord.attributes;
        accR[dataRecord.id || i] = dataRecord.attributes;

        return accR;
      }, {} as ObjectAny);
      return acc;
    }, {} as ObjectAny);
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
   * Retrieve a data source, data record, and optional property path based on a string path.
   * This method parses a string path to identify and retrieve the corresponding data source
   * and data record. If a property path is included in the input, it will also be returned.
   * The method is useful for accessing nested data within data sources.
   *
   * @param {String} path - The string path in the format 'dataSourceId.recordId.property'.
   * @returns {[DataSource?, DataRecord?, String?]} - An array containing the data source,
   * data record, and optional property path.
   * @example
   * const [dataSource, dataRecord, propPath] = dsm.fromPath('my_data_source_id.record_id.myProp');
   * // e.g., [DataSource, DataRecord, 'myProp']
   */
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

  /**
   * Store data sources to a JSON object.
   * @returns {Array} Stored data sources.
   */
  store() {
    const data: any[] = [];
    this.all.forEach((dataSource) => {
      const skipFromStorage = dataSource.get('skipFromStorage');
      if (!skipFromStorage) {
        data.push({
          id: dataSource.id,
          name: dataSource.get('name' as any),
          records: dataSource.records.toJSON(),
          skipFromStorage,
        });
      }
    });

    return { [this.storageKey]: data };
  }

  /**
   * Load data sources from a JSON object.
   * @param {Object} data The data object containing data sources.
   * @returns {Object} Loaded data sources.
   */
  load(data: any) {
    return this.loadProjectData(data);
  }
}
