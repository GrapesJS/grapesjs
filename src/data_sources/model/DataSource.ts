/**
 * The `DataSource` class represents a data source within the editor.
 * It manages a collection of data records and provides methods to interact with them.
 * The `DataSource` can be extended with transformers to modify records during add, read, and delete operations.
 *
 * ### DataSource API
 *
 * * [addRecord](#addrecord)
 * * [getRecord](#getrecord)
 * * [getRecords](#getrecords)
 * * [removeRecord](#removerecord)
 *
 * ### Example of Usage
 *
 * ```js
 * const dataSource = new DataSource({
 *   records: [
 *     { id: 'id1', name: 'value1' },
 *     { id: 'id2', name: 'value2' }
 *   ],
 *   transformers: {
 *     onRecordAdd: ({ record }) => ({ ...record, added: true }),
 *   }
 * }, { em: editor });
 *
 * dataSource.addRecord({ id: 'id3', name: 'value3' });
 * ```
 *
 * @module DataSource
 * @param {DataSourceProps} props - Properties to initialize the data source.
 * @param {DataSourceOptions} opts - Options to initialize the data source.
 * @extends {Model<DataSourceProps>}
 */

import { AddOptions, CombinedModelConstructorOptions, Model, RemoveOptions } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { DataRecordProps } from '../types';
import DataRecord from './DataRecord';
import DataRecords from './DataRecords';
import DataSources from './DataSources';

interface DataSourceOptions extends CombinedModelConstructorOptions<{ em: EditorModel }, DataSource> {}

export interface DataSourceProps {
  /**
   * DataSource id.
   */
  id: string;

  /**
   * DataSource records.
   */
  records?: DataRecords | DataRecord[] | DataRecordProps[];

  /**
   * DataSource validation and transformation factories.
   */

  transformers?: DataSourceTransformers;
}

export interface DataSourceTransformers {
  onRecordAdd?: (args: { record: DataRecordProps }) => DataRecordProps;
  onRecordSet?: (args: { id: string | number; key: string; value: any }) => any;
  onRecordDelete?: (args: { record: DataRecord }) => void;
  onRecordRead?: (args: { record: DataRecord }) => DataRecord;
}

export default class DataSource extends Model<DataSourceProps> {
  transformers: DataSourceTransformers;

  /**
   * Returns the default properties for the data source.
   * These include an empty array of records and an empty object of transformers.
   *
   * @returns {Object} The default attributes for the data source.
   * @name defaults
   */
  defaults() {
    return {
      records: [],
      transformers: {},
    };
  }

  /**
   * Initializes a new instance of the `DataSource` class.
   * It sets up the transformers and initializes the collection of records.
   * If the `records` property is not an instance of `DataRecords`, it will be converted into one.
   *
   * @param {DataSourceProps} props - Properties to initialize the data source.
   * @param {DataSourceOptions} opts - Options to initialize the data source.
   * @name constructor
   */
  constructor(props: DataSourceProps, opts: DataSourceOptions) {
    super(props, opts);
    const { records, transformers } = props;
    this.transformers = transformers || {};

    if (!(records instanceof DataRecords)) {
      this.set({ records: new DataRecords(records!, { dataSource: this }) });
    }

    this.listenTo(this.records, 'add', this.onAdd);
  }

  /**
   * Retrieves the collection of records associated with this data source.
   *
   * @returns {DataRecords} The collection of data records.
   * @name records
   */
  get records() {
    return this.attributes.records as DataRecords;
  }

  /**
   * Retrieves the editor model associated with this data source.
   *
   * @returns {EditorModel} The editor model.
   * @name em
   */
  get em() {
    return (this.collection as unknown as DataSources).em;
  }

  /**
   * Handles the `add` event for records in the data source.
   * This method triggers a change event on the newly added record.
   *
   * @param {DataRecord} dr - The data record that was added.
   * @private
   * @name onAdd
   */
  onAdd(dr: DataRecord) {
    dr.triggerChange();
  }

  /**
   * Adds a new record to the data source.
   * If a transformer is provided for the `onRecordAdd` event, it will be applied to the record before adding it.
   *
   * @param {DataRecordProps} record - The properties of the record to add.
   * @param {AddOptions} [opts] - Options to apply when adding the record.
   * @returns {DataRecord} The added data record.
   * @name addRecord
   */
  addRecord(record: DataRecordProps, opts?: AddOptions) {
    const onRecordAdd = this.transformers.onRecordAdd;
    if (onRecordAdd) {
      record = onRecordAdd({ record });
    }

    return this.records.add(record, opts);
  }

  /**
   * Retrieves a record from the data source by its ID.
   * If a transformer is provided for the `onRecordRead` event, it will be applied to the record before returning it.
   *
   * @param {string | number} id - The ID of the record to retrieve.
   * @returns {DataRecord | undefined} The data record, or `undefined` if no record is found with the given ID.
   * @name getRecord
   */
  getRecord(id: string | number): DataRecord | undefined {
    const onRecordRead = this.transformers.onRecordRead;
    const record = this.records.get(id);
    if (record && onRecordRead) {
      return onRecordRead({ record });
    }

    return record;
  }

  /**
   * Retrieves all records from the data source.
   * Each record is processed with the `getRecord` method to apply any read transformers.
   *
   * @returns {Array<DataRecord | undefined>} An array of data records.
   * @name getRecords
   */
  getRecords() {
    return [...this.records.models].map((record) => this.getRecord(record.id));
  }

  /**
   * Removes a record from the data source by its ID.
   * If a transformer is provided for the `onRecordDelete` event, it will be applied before the record is removed.
   *
   * @param {string | number} id - The ID of the record to remove.
   * @param {RemoveOptions} [opts] - Options to apply when removing the record.
   * @returns {DataRecord | undefined} The removed data record, or `undefined` if no record is found with the given ID.
   * @name removeRecord
   */
  removeRecord(id: string | number, opts?: RemoveOptions): DataRecord | undefined {
    const onRecordDelete = this.transformers.onRecordDelete;
    const record = this.getRecord(id);

    if (record && onRecordDelete) {
      onRecordDelete({ record });
    }

    return this.records.remove(id, opts);
  }
}
