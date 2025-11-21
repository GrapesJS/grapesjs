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

import { isString } from 'underscore';
import {
  AddOptions,
  collectionEvents,
  CombinedModelConstructorOptions,
  Model,
  RemoveOptions,
  SetOptions,
} from '../../common';
import EditorModel from '../../editor/model/Editor';
import {
  DataFieldPrimitiveType,
  DataFieldSchemaRelation,
  DataRecordProps,
  DataSourceProps,
  DataSourceProviderResult,
  DataSourceTransformers,
  DataSourceType,
} from '../types';
import { DEF_DATA_FIELD_ID } from '../utils';
import DataRecord from './DataRecord';
import DataRecords from './DataRecords';
import DataSources from './DataSources';

interface DataSourceOptions extends CombinedModelConstructorOptions<{ em: EditorModel }, DataSource> {}
export default class DataSource<DRProps extends DataRecordProps = DataRecordProps> extends Model<
  DataSourceType<DRProps>
> {
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
    } as unknown as DataSourceType<DRProps>;
  }

  /**
   * Initializes a new instance of the `DataSource` class.
   * It sets up the transformers and initializes the collection of records.
   * If the `records` property is not an instance of `DataRecords`, it will be converted into one.
   *
   * @param {DataSourceProps<DRProps>} props - Properties to initialize the data source.
   * @param {DataSourceOptions} opts - Options to initialize the data source.
   * @name constructor
   */
  constructor(props: DataSourceProps<DRProps>, opts: DataSourceOptions) {
    super(
      {
        schema: {},
        ...props,
        records: [],
      } as unknown as DataSourceType<DRProps>,
      opts,
    );
    const { records, transformers } = props;
    this.transformers = transformers || ({} as DataSourceTransformers);

    if (!(records instanceof DataRecords)) {
      this.set({ records: new DataRecords(records!, { dataSource: this }) } as Partial<DataSourceType<DRProps>>);
    }

    this.listenTo(this.records, 'add', this.onAdd);
    this.listenTo(this.records, collectionEvents, this.handleChanges);
  }

  /**
   * Retrieves the collection of records associated with this data source.
   *
   * @returns {DataRecords<DRProps>} The collection of data records.
   * @name records
   */
  get records() {
    return this.attributes.records as NonNullable<DataRecords<DRProps>>;
  }

  /**
   * Retrieves the collection of records associated with this data source.
   *
   * @returns {DataRecords<DRProps>} The collection of data records.
   * @name records
   */
  get schema() {
    return this.attributes.schema!;
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
   * Indicates if the data source has a provider for records.
   */
  get hasProvider() {
    return !!this.attributes.provider;
  }

  /**
   * Handles the `add` event for records in the data source.
   * This method triggers a change event on the newly added record.
   *
   * @param {DataRecord<DRProps>} dr - The data record that was added.
   * @private
   * @name onAdd
   */
  onAdd(dr: DataRecord<DRProps>) {
    dr.triggerChange();
  }

  /**
   * Adds a new record to the data source.
   *
   * @param {DRProps} record - The properties of the record to add.
   * @param {AddOptions} [opts] - Options to apply when adding the record.
   * @returns {DataRecord} The added data record.
   * @name addRecord
   */
  addRecord(record: DRProps, opts?: AddOptions) {
    return this.records.add(record, opts);
  }

  /**
   * Retrieves a record from the data source by its ID.
   *
   * @param {string | number} id - The ID of the record to retrieve.
   * @returns {DataRecord<DRProps> | undefined} The data record, or `undefined` if no record is found with the given ID.
   * @name getRecord
   */
  getRecord(id: string | number): DataRecord | undefined {
    return this.records.get(id);
  }

  /**
   * Retrieves all records from the data source.
   * Each record is processed with the `getRecord` method to apply any read transformers.
   *
   * @returns {Array<DataRecord<DRProps> | undefined>} An array of data records.
   * @name getRecords
   */
  getRecords() {
    return [...this.records.models].map((record) => this.getRecord(record.id)!);
  }

  /**
   * Retrieves all records from the data source with resolved relations based on the schema.
   */
  getResolvedRecords() {
    const schemaEntries = Object.entries(this.schema);
    const records = this.getRecords().map((record) => {
      const result = { ...record.attributes };

      if (schemaEntries.length === 0) return result;

      schemaEntries.forEach(([fieldName, schema]) => {
        const fieldSchema = schema as DataFieldSchemaRelation;
        if (fieldSchema?.type === DataFieldPrimitiveType.relation && fieldSchema.target) {
          const relationValue = result[fieldName];

          if (relationValue) {
            const targetDs = this.em.DataSources.get(fieldSchema.target);
            if (targetDs) {
              const targetRecords = targetDs.records;
              const targetField = fieldSchema.targetField || DEF_DATA_FIELD_ID;

              if (fieldSchema.isMany) {
                const relationValues = Array.isArray(relationValue) ? relationValue : [relationValue];
                const relatedRecords = targetRecords.filter((r) => relationValues.includes(r.attributes[targetField]));
                result[fieldName] = relatedRecords.map((r) => ({ ...r.attributes }));
              } else {
                const relatedRecord = targetDs.records.find((r) => r.attributes[targetField] === relationValue);

                if (relatedRecord) {
                  result[fieldName] = { ...relatedRecord.attributes };
                }
              }
            }
          }
        }
      });

      return result;
    });

    return records;
  }

  async loadProvider() {
    const { attributes, em } = this;
    const { provider } = attributes;

    if (!provider) return;

    if (isString(provider)) {
      // TODO: implement providers as plugins (later)
      return;
    }

    const providerGet = isString(provider.get) ? { url: provider.get } : provider.get;
    const { url, method, headers, body } = providerGet;

    const fetchProvider = async () => {
      const dataSource = this;

      try {
        em.trigger(em.DataSources.events.providerLoadBefore, { dataSource });

        const response = await fetch(url, { method, headers, body });
        if (!response.ok) throw new Error(await response.text());
        const result: DataSourceProviderResult = await response.json();

        if (result?.records) this.setRecords(result.records as any);
        if (result?.schema) this.upSchema(result.schema);

        em.trigger(em.DataSources.events.providerLoad, { result, dataSource });
      } catch (error: any) {
        em.logError(error.message);
        em.trigger(em.DataSources.events.providerLoadError, { dataSource, error });
      }
    };

    await fetchProvider();
  }

  /**
   * Removes a record from the data source by its ID.
   *
   * @param {string | number} id - The ID of the record to remove.
   * @param {RemoveOptions} [opts] - Options to apply when removing the record.
   * @returns {DataRecord<DRProps> | undefined} The removed data record, or `undefined` if no record is found with the given ID.
   * @name removeRecord
   */
  removeRecord(id: string | number, opts?: RemoveOptions) {
    const record = this.getRecord(id);
    if (record?.mutable === false && !opts?.dangerously) {
      throw new Error('Cannot remove immutable record');
    }

    return this.records.remove(id, opts);
  }

  /**
   * Replaces the existing records in the data source with a new set of records.
   *
   * @param {Array<DRProps>} records - An array of data record properties to set.
   * @returns {Array<DataRecord>} An array of the added data records.
   * @name setRecords
   */
  setRecords(records: DRProps[]) {
    this.records.reset([], { silent: true });

    records.forEach((record) => {
      this.records.add(record);
    });
  }

  /**
   * Update the schema.
   * @example
   * dataSource.upSchema({ name: { type: 'string' } });
   */
  upSchema(schema: Partial<typeof this.schema>, opts?: SetOptions) {
    this.set('schema', { ...this.schema, ...schema }, opts);
  }

  /**
   * Get schema field definition.
   * @example
   * const fieldSchema = dataSource.getSchemaField('name');
   * fieldSchema.type; // 'string'
   */
  getSchemaField(fieldKey: keyof DRProps) {
    return this.schema[fieldKey];
  }

  private handleChanges(dataRecord: any, c: any, o: any) {
    const options = o || c;
    this.em.changesUp(options, { dataRecord, options });
  }
}
