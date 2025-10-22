import { Model, Collection, ObjectAny } from '../common';
import DataRecord from './model/DataRecord';
import DataRecords from './model/DataRecords';
import DataVariable, { DataVariableProps } from './model/DataVariable';
import { DataConditionProps, DataCondition } from './model/conditional_variables/DataCondition';

export type DataResolver = DataVariable | DataCondition;
export type DataResolverProps = DataVariableProps | DataConditionProps;
export type ResolverFromProps<T extends DataResolverProps> = T extends DataVariableProps
  ? DataVariable
  : T extends DataConditionProps
    ? DataCondition
    : never;

export interface DataRecordProps extends ObjectAny {
  /**
   * Record id.
   */
  id: string;

  /**
   * Specifies if the record is mutable. Defaults to `true`.
   */
  mutable?: boolean;

  [key: string]: any;
}

export interface DataSourceListener {
  obj: Model | Collection;
  event: string;
}

interface BaseDataSource {
  /**
   * DataSource id.
   */
  id: string;

  /**
   * DataSource validation and transformation factories.
   */
  transformers?: DataSourceTransformers;

  /**
   * If true will store the data source in the GrapesJS project.json file.
   */
  skipFromStorage?: boolean;
}

export enum DataFieldPrimitiveType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  date = 'date',
  json = 'json',
  reference = 'reference',
}

export type BaseFieldType =
  | { type: DataFieldPrimitiveType.string }
  | { type: DataFieldPrimitiveType.number }
  | { type: DataFieldPrimitiveType.boolean }
  | { type: DataFieldPrimitiveType.date }
  | { type: DataFieldPrimitiveType.json }
  | {
      type: DataFieldPrimitiveType.reference;
      target: string;
      targetKey?: string;
      isMany?: boolean;
    };

export interface DataFieldReferenceProps {
  /** The target data source ID or name this field references */
  target: string;

  /** Optional key in the target data source */
  targetKey?: string;

  /** Relation type: one-to-one or one-to-many */
  isMany?: boolean;
}

export interface DataFieldSchema<T = any> {
  type: DataFieldPrimitiveType | BaseFieldType;

  /** Marks the field as the primary key (implies unique) */
  primary?: boolean;

  /** Field must be present in all records */
  required?: boolean;

  /** Value must be unique across all records */
  unique?: boolean;

  /** Default value when not provided in record */
  default?: T;

  /** Restrict allowed values */
  enum?: T[];

  /** Custom validator returning true if valid */
  validate?: (value: T, record: Record<string, any>) => boolean;

  /** Optional description, used for UI or docs */
  description?: string;

  /** Optional label, used for UI or docs */
  label?: string;

  /** Optional field order for rendering */
  order?: number;
}

export interface DataSourceType<DR extends DataRecordProps> extends BaseDataSource {
  records: DataRecords<DR>;
  schema?: Record<string, DataFieldSchema>;
}
export interface DataSourceProps<DR extends DataRecordProps> extends BaseDataSource {
  records?: DataRecords<DR> | DataRecord<DR>[] | DR[];
}
export type RecordPropsType<T> = T extends DataRecord<infer U> ? U : never;
export interface DataSourceTransformers {
  onRecordSetValue?: (args: { id: string | number; key: string; value: any }) => any;
}

type DotSeparatedKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${DotSeparatedKeys<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

export type DeepPartialDot<T> = {
  [P in DotSeparatedKeys<T>]?: P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Rest extends DotSeparatedKeys<T[K]>
        ? DeepPartialDot<T[K]>[Rest]
        : never
      : never
    : P extends keyof T
      ? T[P]
      : never;
};

/**{START_EVENTS}*/
export enum DataSourcesEvents {
  /**
   * @event `data:add` Added new data source.
   * @example
   * editor.on('data:add', (dataSource) => { ... });
   */
  add = 'data:add',
  addBefore = 'data:add:before',

  /**
   * @event `data:remove` Data source removed.
   * @example
   * editor.on('data:remove', (dataSource) => { ... });
   */
  remove = 'data:remove',
  removeBefore = 'data:remove:before',

  /**
   * @event `data:update` Data source updated.
   * @example
   * editor.on('data:update', (dataSource, changes) => { ... });
   */
  update = 'data:update',

  /**
   * @event `data:path` Data record path update.
   * @example
   * editor.on('data:path:SOURCE_ID.RECORD_ID.PROP_NAME', ({ dataSource, dataRecord, path }) => { ... });
   * editor.on('data:path', ({ dataSource, dataRecord, path }) => {
   *  console.log('Path update in any data source')
   * });
   */
  path = 'data:path',

  /**
   * @event `data:pathSource` Data record path update per source.
   * @example
   * editor.on('data:pathSource:SOURCE_ID', ({ dataSource, dataRecord, path }) => { ... });
   */
  pathSource = 'data:pathSource:',

  /**
   * @event `data` Catch-all event for all the events mentioned above.
   * @example
   * editor.on('data', ({ event, model, ... }) => { ... });
   */
  all = 'data',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default DataSourcesEvents;
