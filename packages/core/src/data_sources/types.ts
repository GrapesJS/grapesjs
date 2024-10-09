import { ObjectAny } from '../common';
import DataRecord from './model/DataRecord';
import DataRecords from './model/DataRecords';

export interface DataRecordProps extends ObjectAny {
  /**
   * Record id.
   */
  id: string;

  /**
   * Specifies if the record is mutable. Defaults to `true`.
   */
  mutable?: boolean;
}

export interface DataVariableListener {
  obj: any;
  event: string;
}

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

  /**
   * If true will store the data source in the GrapesJS project.json file.
   */
  skipFromStorage?: boolean;
}

export interface DataSourceTransformers {
  onRecordSetValue?: (args: { id: string | number; key: string; value: any }) => any;
}

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
   * editor.on('data:path:SOURCE_ID:RECORD_ID:PROP_NAME', ({ dataSource, dataRecord, path }) => { ... });
   */
  path = 'data:path',

  /**
   * @event `data` Catch-all event for all the events mentioned above.
   * @example
   * editor.on('data', ({ event, model, ... }) => { ... });
   */
  all = 'data',
}
/**{END_EVENTS}*/
