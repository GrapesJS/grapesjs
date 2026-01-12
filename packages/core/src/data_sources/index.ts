/**
 * This module manages data sources within the editor.
 * Once the editor is instantiated, you can use the following API to manage data sources:
 *
 * ```js
 * const editor = grapesjs.init({ ... });
 * const dsm = editor.DataSources;
 * ```
 *
 * {REPLACE_EVENTS}
 *
 * ## Methods
 * * [add](#add) - Add a new data source.
 * * [get](#get) - Retrieve a data source by its ID.
 * * [getAll](#getall) - Retrieve all data sources.
 * * [remove](#remove) - Remove a data source by its ID.
 * * [clear](#clear) - Remove all data sources.
 *
 * [DataSource]: datasource.html
 *
 * @module DataSources
 */

import { Events } from 'backbone';
import { isEmpty } from 'underscore';
import { ItemManagerModule, ModuleConfig } from '../abstract/Module';
import { AddOptions, collectionEvents, ObjectAny, RemoveOptions } from '../common';
import EditorModel from '../editor/model/Editor';
import { get, set, stringToPath } from '../utils/mixins';
import defConfig, { DataSourcesConfig } from './config/config';
import { AnyTypeOperation } from './model/conditional_variables/operators/AnyTypeOperator';
import { BooleanOperation } from './model/conditional_variables/operators/BooleanOperator';
import { NumberOperation } from './model/conditional_variables/operators/NumberOperator';
import { StringOperation } from './model/conditional_variables/operators/StringOperator';
import { DataCollectionStateType } from './model/data_collection/types';
import DataRecord from './model/DataRecord';
import DataSource from './model/DataSource';
import DataSources from './model/DataSources';
import {
  DataCollectionKeys,
  DataComponentTypes,
  DataFieldPrimitiveType,
  DataRecordProps,
  DataSourceProps,
  DataSourcesEvents,
} from './types';

export default class DataSourceManager extends ItemManagerModule<DataSourcesConfig & ModuleConfig, DataSources> {
  storageKey = 'dataSources';
  events = DataSourcesEvents;
  dataComponentTypes = DataComponentTypes;
  dataCollectionKeys = DataCollectionKeys;
  dataCollectionStateTypes = DataCollectionStateType;
  dataFieldPrimitiveType = DataFieldPrimitiveType;
  dataOperationTypes = {
    any: AnyTypeOperation,
    boolean: BooleanOperation,
    number: NumberOperation,
    string: StringOperation,
  };
  destroy(): void {}

  constructor(em: EditorModel) {
    super(em, 'DataSources', new DataSources([], em), DataSourcesEvents, defConfig());
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
  add<DRProps extends DataRecordProps>(props: DataSourceProps<DRProps>, opts: AddOptions = {}): DataSource<DRProps> {
    const { all } = this;
    props.id = props.id || this._createId();

    return all.add(props, opts) as DataSource<DRProps>;
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
   * Return all data sources.
   * @returns {Array<[DataSource]>}
   * @example
   * const ds = dsm.getAll();
   */
  getAll() {
    return [...this.all.models];
  }

  /**
   * Get value from data sources by path.
   * @param {String} path Path to value.
   * @param {any} defValue Default value if the path is not found.
   * @returns {any}
   * const value = dsm.getValue('ds_id.record_id.propName', 'defaultValue');
   */
  getValue(path: string | string[], defValue?: any, opts?: { context?: Record<string, any> }) {
    return get(opts?.context || this.getContext(), path, defValue);
  }

  /**
   * Set value in data sources by path.
   * @param {String} path Path to value in format 'dataSourceId.recordId.propName'
   * @param {any} value Value to set
   * @returns {Boolean} Returns true if the value was set successfully
   * @example
   * dsm.setValue('ds_id.record_id.propName', 'new value');
   */
  setValue(path: string, value: any) {
    const [ds, record, propPath] = this.fromPath(path);

    if (record && (propPath || propPath === '')) {
      let attrs = { ...record.attributes };
      if (set(attrs, propPath || '', value)) {
        record.set(attrs);
        return true;
      }
    }

    return false;
  }

  getContext() {
    return this.all.reduce((acc, ds) => {
      acc[ds.id] = ds.records.reduce((accR, dr, i) => {
        const dataRecord = dr;

        const attributes = { ...dataRecord.attributes };
        delete attributes.__p;
        accR[dataRecord.id || i] = attributes;

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
    const data: DataSourceProps[] = [];
    this.all.forEach((dataSource) => {
      const { skipFromStorage, transformers, records, schema, ...rest } = dataSource.attributes;

      if (!skipFromStorage) {
        data.push({
          ...rest,
          id: rest.id!,
          schema: !isEmpty(schema) ? schema : undefined,
          records: !rest.provider ? records : undefined,
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
    const { config, all, events, em } = this;
    const result = this.loadProjectData(data);

    if (config.autoloadProviders) {
      const dsWithProviders = all.filter((ds) => ds.hasProvider);

      if (!!dsWithProviders.length) {
        const loadProviders = async () => {
          em.trigger(events.providerLoadAllBefore);
          const providersToLoad = dsWithProviders.map((ds) => ds.loadProvider());
          await Promise.all(providersToLoad);
          em.trigger(events.providerLoadAll);
        };
        loadProviders();
      }
    }

    return result;
  }

  postLoad() {
    const { em, all } = this;
    em.listenTo(all, collectionEvents, (dataSource, c, o) => {
      const options = o || c;
      em.changesUp(options, { dataSource, options });
    });
    this.em.UndoManager.add(all);
  }
}
