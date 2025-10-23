import DataSourceManager from '../../../src/data_sources';
import { DataSourceProps, DataFieldPrimitiveType } from '../../../src/data_sources/types';
import { setupTestEditor } from '../../common';
import EditorModel from '../../../src/editor/model/Editor';

describe('DataSourceManager', () => {
  let em: EditorModel;
  let dsm: DataSourceManager;
  type Record = { id: string; name: string };
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

  test('getValue', () => {
    const ds = addDataSource();
    const testPath = ds.getRecord('id2')?.getPath('name') || '';
    expect(dsm.getValue(`${ds.id}.id1.name`)).toBe('Name1');
    expect(dsm.getValue(testPath)).toBe('Name2');
    expect(dsm.getValue(`${ds.id}.non-existing.name`)).toBeUndefined();
    expect(dsm.getValue(`${ds.id}.non-existing.name`, 'Default name')).toBe('Default name');
    expect(dsm.getValue(`${ds.id}.id1.nonExisting`)).toBeUndefined();
    expect(dsm.getValue('non-existing-ds.id1.name')).toBeUndefined();
  });
});
