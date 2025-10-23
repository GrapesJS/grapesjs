import { DataSourceManager } from '../../../../src';
import DataSource from '../../../../src/data_sources/model/DataSource';
import {
  DataFieldPrimitiveType,
  DataFieldSchemaNumber,
  DataFieldSchemaString,
  DataRecordProps,
} from '../../../../src/data_sources/types';
import Editor from '../../../../src/editor/model/Editor';
import { setupTestEditor } from '../../../common';

interface TestRecord extends DataRecordProps {
  name?: string;
  age?: number;
}

describe('DataSource', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  let ds: DataSource<TestRecord>;

  const addTestDataSource = (records?: TestRecord[]) => {
    return dsm.add<TestRecord>({ id: 'test', records: records || [{ id: 'user1', age: 30 }] });
  };

  beforeEach(() => {
    ({ em, dsm } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  describe('Schema', () => {
    const schemaName: DataFieldSchemaString = {
      type: DataFieldPrimitiveType.string,
      label: 'Name',
    };
    const schemaAge: DataFieldSchemaNumber = {
      type: DataFieldPrimitiveType.number,
      label: 'Age',
      default: 18,
    };

    beforeEach(() => {
      ds = addTestDataSource();
    });

    test('Initialize with empty schema', () => {
      expect(ds.schema).toEqual({});
    });

    test('Add and update schema', () => {
      const schemaNameDef: typeof ds.schema = { name: schemaName };
      const schemaAgeDef: typeof ds.schema = { age: schemaAge };
      ds.upSchema(schemaNameDef);
      ds.upSchema(schemaAgeDef);
      expect(ds.schema).toEqual({ ...schemaNameDef, ...schemaAgeDef });
    });

    test('Should update existing field schema', () => {
      ds.upSchema({ name: schemaName });

      const updatedSchema: typeof ds.schema = {
        name: {
          ...schemaName,
          description: 'User name field',
        },
      };
      ds.upSchema(updatedSchema);
      expect(ds.schema).toEqual(updatedSchema);
    });

    test('Should get field schema', () => {
      ds.upSchema({
        name: schemaName,
        age: schemaAge,
      });
      expect(ds.getSchemaField('name')).toEqual(schemaName);
      expect(ds.getSchemaField('age')).toEqual(schemaAge);
      expect(ds.getSchemaField('nonExistentField')).toBeUndefined();
    });
  });
});
