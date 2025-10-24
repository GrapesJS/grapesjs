import { DataSourceManager } from '../../../../src';
import DataSource from '../../../../src/data_sources/model/DataSource';
import {
  DataFieldPrimitiveType,
  DataFieldSchemaNumber,
  DataFieldSchemaString,
  DataRecordProps,
  DataSourceProviderResult,
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
  let editor: Editor['Editor'];
  let dsm: DataSourceManager;
  let ds: DataSource<TestRecord>;
  const categoryRecords = [
    { id: 'cat1', uid: 'cat1-uid', name: 'Category 1' },
    { id: 'cat2', uid: 'cat2-uid', name: 'Category 2' },
    { id: 'cat3', uid: 'cat3-uid', name: 'Category 3' },
  ];
  const userRecords = [
    { id: 'user1', username: 'user_one' },
    { id: 'user2', username: 'user_two' },
    { id: 'user3', username: 'user_three' },
  ];
  const blogRecords = [
    { id: 'blog1', title: 'First Blog', author: 'user1', categories: ['cat1-uid'] },
    { id: 'blog2', title: 'Second Blog', author: 'user2' },
    { id: 'blog3', title: 'Third Blog', categories: ['cat1-uid', 'cat3-uid'] },
  ];

  const addTestDataSource = (records?: TestRecord[]) => {
    return dsm.add<TestRecord>({ id: 'test', records: records || [{ id: 'user1', age: 30 }] });
  };

  beforeEach(() => {
    ({ em, dsm, editor } = setupTestEditor());
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

      test('return 1:many resolved values', () => {
        const blogsDS = dsm.get('blogs');
        blogsDS.upSchema({
          categories: {
            type: DataFieldPrimitiveType.relation,
            target: 'categories',
            targetField: 'uid',
            isMany: true,
          },
        });
        const records = blogsDS.getResolvedRecords();
        expect(records).toEqual([
          { ...blogRecords[0], author: userRecords[0], categories: [categoryRecords[0]] },
          { ...blogRecords[1], author: userRecords[1] },
          { ...blogRecords[2], categories: [categoryRecords[0], categoryRecords[2]] },
        ]);
      });
    });
  });

  describe('Providers', () => {
    const testApiUrl = 'https://api.example.com/data';
    const testHeaders = { 'Content-Type': 'application/json' };
    const getMockSchema = () => ({
      author: {
        type: DataFieldPrimitiveType.relation,
        target: 'users',
        targetField: 'id',
      },
    });
    const getMockProviderResponse: () => DataSourceProviderResult = () => ({
      records: blogRecords,
      schema: getMockSchema(),
    });
    const getProviderBlogsGet = () => ({ url: testApiUrl, headers: testHeaders });
    const addBlogsWithProvider = () => {
      return dsm.add({
        id: 'blogs',
        name: 'My blogs',
        provider: {
          get: getProviderBlogsGet(),
        },
      });
    };

    beforeEach(() => {
      jest.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(getMockProviderResponse()),
        } as Response),
      );

      dsm.add({
        id: 'categories',
        records: categoryRecords,
      });
      dsm.add({
        id: 'users',
        records: userRecords,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('loadProvider', async () => {
      const ds = addBlogsWithProvider();
      await ds.loadProvider();

      expect(fetch).toHaveBeenCalledWith(testApiUrl, { headers: testHeaders });
      expect(ds.schema).toEqual(getMockSchema());
      expect(ds.getResolvedRecords()).toEqual([
        { ...blogRecords[0], author: userRecords[0] },
        { ...blogRecords[1], author: userRecords[1] },
        blogRecords[2],
      ]);
    });

    test('loadProvider with failed fetch', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      em.config.log = false;
      const ds = addBlogsWithProvider();
      await ds.loadProvider();

      expect(fetch).toHaveBeenCalledWith(testApiUrl, { headers: testHeaders });
      expect(ds.schema).toEqual({});
      expect(ds.getRecords().length).toBe(0);
    });

    test('records loaded from the provider are not persisted', async () => {
      const ds = addBlogsWithProvider();
      const eventLoad = jest.fn();
      em.on(dsm.events.providerLoad, eventLoad);

      await ds.loadProvider();

      expect(editor.getProjectData().dataSources).toEqual([
        { id: 'categories', records: categoryRecords },
        { id: 'users', records: userRecords },
        {
          id: 'blogs',
          name: 'My blogs',
          schema: getMockSchema(),
          provider: { get: getProviderBlogsGet() },
        },
      ]);
      expect(eventLoad).toHaveBeenCalledTimes(1);
      expect(eventLoad).toHaveBeenCalledWith({
        dataSource: ds,
        result: getMockProviderResponse(),
      });
    });

    test('load providers on project load', (done) => {
      dsm.getConfig().autoloadProviders = true;

      editor.on(dsm.events.providerLoadAll, () => {
        expect(dsm.get('blogs').getResolvedRecords()).toEqual([
          { ...blogRecords[0], author: userRecords[0] },
          { ...blogRecords[1], author: userRecords[1] },
          blogRecords[2],
        ]);

        expect(editor.getProjectData().dataSources).toEqual([
          { id: 'categories', records: categoryRecords },
          { id: 'users', records: userRecords },
          {
            id: 'blogs',
            schema: getMockSchema(),
            provider: { get: testApiUrl },
          },
        ]);

        done();
      });

      editor.loadProjectData({
        dataSources: [
          { id: 'categories', records: categoryRecords },
          { id: 'users', records: userRecords },
          {
            id: 'blogs',
            provider: { get: testApiUrl },
          },
        ],
      });
    });
  });
});
