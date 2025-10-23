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

const serializeRecords = (records: any[]) => JSON.parse(JSON.stringify(records));

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

    describe('Relations', () => {
      const categoryRecords = [
        { id: 'cat1', uid: 'cat1-uid', name: 'Category 1' },
        { id: 'cat2', uid: 'cat2-uid', name: 'Category 2' },
      ];
      const userRecords = [
        { id: 'user1', username: 'user_one' },
        { id: 'user2', username: 'user_two' },
      ];
      const blogRecords = [
        { id: 'blog1', title: 'First Blog', author: 'user1', categories: ['cat1-uid'] },
        { id: 'blog2', title: 'Second Blog', author: 'user2' },
        { id: 'blog3', title: 'Third Blog', categories: ['cat1-uid', 'cat2-uid'] },
      ];

      beforeEach(() => {
        dsm.add({
          id: 'categories',
          records: categoryRecords,
        });
        dsm.add({
          id: 'users',
          records: userRecords,
        });
        dsm.add({
          id: 'blogs',
          records: blogRecords,
          schema: {
            title: {
              type: DataFieldPrimitiveType.string,
            },
            author: {
              type: DataFieldPrimitiveType.relation,
              target: 'users',
              targetField: 'id',
            },
          },
        });
      });

      test('return default values', () => {
        const blogsDS = dsm.get('blogs');
        expect(serializeRecords(blogsDS.getRecords())).toEqual(blogRecords);
      });

      test('return 1:1 resolved values', () => {
        const blogsDS = dsm.get('blogs');
        const records = blogsDS.getResolvedRecords();
        expect(records).toEqual([
          { ...blogRecords[0], author: userRecords[0] },
          { ...blogRecords[1], author: userRecords[1] },
          blogRecords[2],
        ]);
      });
    });
  });
});
