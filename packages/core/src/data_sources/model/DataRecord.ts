/**
 * The `DataRecord` class represents a single record within a data source.
 * It extends the base `Model` class and provides additional methods and properties specific to data records.
 * Each `DataRecord` is associated with a `DataSource` and can trigger events when its properties change.
 *
 * ### DataRecord API
 *
 * * [getPath](#getpath)
 * * [getPaths](#getpaths)
 * * [set](#set)
 *
 * ### Example of Usage
 *
 * ```js
 * const record = new DataRecord({ id: 'record1', name: 'value1' }, { collection: dataRecords });
 * const path = record.getPath(); // e.g., 'SOURCE_ID.record1'
 * record.set('name', 'newValue');
 * ```
 *
 * @module DataRecord
 * @param {DataRecordProps} props - Properties to initialize the data record.
 * @param {Object} opts - Options for initializing the data record.
 * @extends {Model<DataRecordProps>}
 */

import { keys } from 'underscore';
import { Model, SetOptions } from '../../common';
import { DataRecordProps, DataSourcesEvents } from '../types';
import DataRecords from './DataRecords';
import DataSource from './DataSource';
import EditorModel from '../../editor/model/Editor';
import { _StringKey } from 'backbone';

export default class DataRecord<T extends DataRecordProps = DataRecordProps> extends Model<T> {
  public mutable: boolean;

  constructor(props: T, opts = {}) {
    super(props, opts);
    this.mutable = props.mutable ?? true;
    this.on('change', this.handleChange);
  }

  get cl() {
    return this.collection as unknown as DataRecords;
  }

  get dataSource(): DataSource {
    return this.cl.dataSource;
  }

  get em(): EditorModel {
    return this.dataSource.em;
  }

  get index(): number {
    return this.cl.indexOf(this);
  }

  /**
   * Handles changes to the record's attributes.
   * This method triggers a change event for each property that has been altered.
   *
   * @private
   * @name handleChange
   */
  handleChange() {
    const changed = this.changedAttributes();
    keys(changed).forEach((prop) => this.triggerChange(prop));
  }

  /**
   * Get the path of the record.
   * The path is a string that represents the location of the record within the data source.
   * Optionally, include a property name to create a more specific path.
   *
   * @param {String} [prop] - Optional property name to include in the path.
   * @param {Object} [opts] - Options for path generation.
   * @param {Boolean} [opts.useIndex] - Whether to use the index of the record in the path.
   * @returns {String} - The path of the record.
   * @name getPath
   * @example
   * const pathRecord = record.getPath();
   * // e.g., 'SOURCE_ID.record1'
   * const pathRecord2 = record.getPath('myProp');
   * // e.g., 'SOURCE_ID.record1.myProp'
   */
  getPath(prop?: string, opts: { useIndex?: boolean } = {}) {
    const { dataSource, id, index } = this;
    const dsId = dataSource.id;
    const suffix = prop ? `.${prop}` : '';
    return `${dsId}.${opts.useIndex ? index : id}${suffix}`;
  }

  /**
   * Get both ID-based and index-based paths of the record.
   * Returns an array containing the paths using both ID and index.
   *
   * @param {String} [prop] - Optional property name to include in the paths.
   * @returns {Array<String>} - An array of paths.
   * @name getPaths
   * @example
   * const paths = record.getPaths();
   * // e.g., ['SOURCE_ID.record1', 'SOURCE_ID.0']
   */
  getPaths(prop?: string) {
    return [this.getPath(prop), this.getPath(prop, { useIndex: true })];
  }

  /**
   * Trigger a change event for the record.
   * Optionally, include a property name to trigger a change event for a specific property.
   *
   * @param {String} [prop] - Optional property name to trigger a change event for a specific property.
   * @name triggerChange
   */
  triggerChange(prop?: string) {
    const { dataSource, em } = this;
    const data = { dataSource, dataRecord: this };
    const paths = this.getPaths(prop);
    paths.forEach((path) => em.trigger(`${DataSourcesEvents.path}:${path}`, { ...data, path }));
  }

  /**
   * Set a property on the record, optionally using transformers.
   * If transformers are defined for the record, they will be applied to the value before setting it.
   *
   * @param {String|Object} attributeName - The name of the attribute to set, or an object of key-value pairs.
   * @param {any} [value] - The value to set for the attribute.
   * @param {Object} [options] - Options to apply when setting the attribute.
   * @param {Boolean} [options.avoidTransformers] - If true, transformers will not be applied.
   * @returns {DataRecord} - The instance of the DataRecord.
   * @name set
   * @example
   * record.set('name', 'newValue');
   * // Sets 'name' property to 'newValue'
   */
  set<A extends _StringKey<T>>(
    attributeName: Partial<T> | A,
    value?: SetOptions | T[A] | undefined,
    options?: SetOptions | undefined,
  ): this;
  set(attributeName: unknown, value?: unknown, options?: SetOptions): DataRecord {
    if (!this.isNew() && this.attributes.mutable === false) {
      throw new Error('Cannot modify immutable record');
    }

    const onRecordSetValue = this.dataSource?.transformers?.onRecordSetValue;

    const applySet = (key: string, val: unknown, opts: SetOptions = {}) => {
      const newValue =
        opts?.avoidTransformers || !onRecordSetValue
          ? val
          : onRecordSetValue({
              id: this.id,
              key,
              value: val,
            });
      super.set(key, newValue, opts);
      // This ensures to trigger the change event with partial updates
      super.set({ __p: opts.partial ? true : undefined } as any, opts);
    };

    if (typeof attributeName === 'object' && attributeName !== null) {
      const attributes = attributeName as Partial<T>;
      for (const [key, val] of Object.entries(attributes)) {
        applySet(key, val, value as SetOptions);
      }
    } else {
      applySet(attributeName as string, value, options);
    }

    return this;
  }
}
