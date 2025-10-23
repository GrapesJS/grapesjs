import DataSourceManager from '../../../src/data_sources';
import { DataSourceProps } from '../../../src/data_sources/types';
import EditorModel from '../../../src/editor/model/Editor';
import { setupTestEditor } from '../../common';

describe('DataSourceManager', () => {
  let em: EditorModel;
  let dsm: DataSourceManager;
  type Record = { id: string; name: string; metadata?: any };
  const dsTest: DataSourceProps<Record> = {
    id: 'ds1',
    records: [
      { id: 'id1', name: 'Name1' },
      { id: 'id2', name: 'Name2' },
      { id: 'id3', name: 'Name3' },
    ],
  };

  const addDataSource = () => dsm.add(dsTest);

  beforeEach(() => {
    ({ em, dsm } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  test('DataSourceManager exists', () => {
    expect(dsm).toBeTruthy();
  });

  test('add DataSource with records', () => {
    const eventAdd = jest.fn();
    em.on(dsm.events.add, eventAdd);
    const ds = addDataSource();
    expect(dsm.getAll().length).toBe(1);
    expect(eventAdd).toHaveBeenCalledTimes(1);
    expect(ds.getRecords().length).toBe(3);
  });

  test('get added DataSource', () => {
    const ds = addDataSource();
    expect(dsm.get(dsTest.id)).toBe(ds);
  });

  test('remove DataSource', () => {
    const event = jest.fn();
    em.on(dsm.events.remove, event);
    const ds = addDataSource();
    dsm.remove('ds1');
    expect(dsm.getAll().length).toBe(0);
    expect(event).toHaveBeenCalledTimes(1);
    expect(event).toHaveBeenCalledWith(ds, expect.any(Object));
  });

  describe('getValue', () => {
    test('getValue', () => {
      const ds = addDataSource();
      const testPath = ds.getRecord('id2')?.getPath('name') || '';
      expect(dsm.getValue(testPath)).toBe('Name2');
      expect(dsm.getValue(`ds1.id1.name`)).toBe('Name1');
      expect(dsm.getValue(`ds1[id1]name`)).toBe('Name1');
      expect(dsm.getValue(`ds1.non-existing.name`)).toBeUndefined();
      expect(dsm.getValue(`ds1.non-existing.name`, 'Default name')).toBe('Default name');
      expect(dsm.getValue(`ds1.id1.nonExisting`)).toBeUndefined();
      expect(dsm.getValue('non-existing-ds.id1.name')).toBeUndefined();
    });

    test('getValue with nested values', () => {
      const ds = addDataSource();
      const address = { city: 'CityName' };
      const roles = ['admin', 'user'];
      ds.addRecord({
        id: 'id4',
        name: 'Name4',
        metadata: { address, roles },
      });

      expect(dsm.getValue(`ds1.id4.metadata.address`)).toEqual(address);
      expect(dsm.getValue(`ds1.id4.metadata.address.city`)).toEqual(address.city);
      expect(dsm.getValue(`ds1.id4.metadata.roles`)).toEqual(roles);
      expect(dsm.getValue(`ds1.id4.metadata.roles[1]`)).toEqual(roles[1]);
    });
  });

  describe('setValue', () => {
    test('Should set value in existing record', () => {
      addDataSource();
      expect(dsm.setValue('ds1.id1.name', 'Name1 Up')).toBe(true);
      expect(dsm.getValue('ds1.id1.name')).toBe('Name1 Up');

      expect(dsm.setValue('ds1.id1.newField', 'new field value')).toBe(true);
      expect(dsm.getValue('ds1.id1.newField')).toBe('new field value');
      expect(dsm.setValue('non-existing-ds.id1.name', 'New Name')).toBe(false);

      expect(dsm.setValue('invalid-path', 'New Name')).toBe(false);
    });
  });
});
