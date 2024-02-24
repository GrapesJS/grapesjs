import { ObjectAny } from '../common';
import { DataRecord } from './model/DataRecord';
import { DataRecords } from './model/DataRecords';

export interface DataSourceProps {
  /**
   * DataSource id.
   */
  id: string;

  /**
   * DataSource records.
   */
  records?: DataRecords | DataRecord[] | DataRecordProps[];
}

export interface DataRecordProps extends ObjectAny {
  /**
   * Record id.
   */
  id: string;
}
