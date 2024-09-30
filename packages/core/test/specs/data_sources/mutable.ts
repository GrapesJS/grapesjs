import DataSourceManager from '../../../src/data_sources';
import { setupTestEditor } from '../../common';
import EditorModel from '../../../src/editor/model/Editor';

describe('DataSource Immutability', () => {
  let em: EditorModel;
  let dsm: DataSourceManager;

  beforeEach(() => {
    ({ em, dsm } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  test('set throws error for immutable record', () => {
    const ds = dsm.add({
      id: 'testDs1',
      records: [{ id: 'id1', name: 'Name1', value: 100, mutable: false }],
    });
    const record = ds.getRecord('id1');

    expect(() => record?.set('name', 'UpdatedName')).toThrow('Cannot modify immutable record');
    expect(record?.get('name')).toBe('Name1');
  });

  test('set throws error for multiple attributes on immutable record', () => {
    const ds = dsm.add({
      id: 'testDs2',
      records: [{ id: 'id1', name: 'Name1', value: 100, mutable: false }],
    });
    const record = ds.getRecord('id1');

    expect(() => record?.set({ name: 'UpdatedName', value: 150 })).toThrow('Cannot modify immutable record');
    expect(record?.get('name')).toBe('Name1');
    expect(record?.get('value')).toBe(100);
  });

  test('removeRecord throws error for immutable record', () => {
    const ds = dsm.add({
      id: 'testDs3',
      records: [{ id: 'id1', name: 'Name1', value: 100, mutable: false }],
    });

    expect(() => ds.removeRecord('id1')).toThrow('Cannot remove immutable record');
    expect(ds.getRecord('id1')).toBeTruthy();
  });

  test('addRecord creates an immutable record', () => {
    const ds = dsm.add({
      id: 'testDs4',
      records: [],
    });

    ds.addRecord({ id: 'id1', name: 'Name1', value: 100, mutable: false });
    const newRecord = ds.getRecord('id1');

    expect(() => newRecord?.set('name', 'UpdatedName')).toThrow('Cannot modify immutable record');
    expect(newRecord?.get('name')).toBe('Name1');
  });

  test('setRecords replaces all records with immutable ones', () => {
    const ds = dsm.add({
      id: 'testDs5',
      records: [],
    });

    ds.setRecords([
      { id: 'id1', name: 'Name1', value: 100, mutable: false },
      { id: 'id2', name: 'Name2', value: 200, mutable: false },
    ]);

    const record1 = ds.getRecord('id1');
    const record2 = ds.getRecord('id2');

    expect(() => record1?.set('name', 'UpdatedName1')).toThrow('Cannot modify immutable record');
    expect(() => record2?.set('name', 'UpdatedName2')).toThrow('Cannot modify immutable record');
    expect(record1?.get('name')).toBe('Name1');
    expect(record2?.get('name')).toBe('Name2');
  });

  test('batch update throws error for immutable records', () => {
    const ds = dsm.add({
      id: 'testDs6',
      records: [
        { id: 'id1', name: 'Name1', value: 100, mutable: false },
        { id: 'id2', name: 'Name2', value: 200, mutable: false },
      ],
    });

    expect(() => {
      ds.records.set([
        { id: 'id1', name: 'BatchUpdate1' },
        { id: 'id2', name: 'BatchUpdate2' },
      ]);
    }).toThrow('Cannot modify immutable record');

    expect(ds.getRecord('id1')?.get('name')).toBe('Name1');
    expect(ds.getRecord('id2')?.get('name')).toBe('Name2');
  });

  test('nested property update throws error for immutable record', () => {
    const ds = dsm.add({
      id: 'testDs7',
      records: [{ id: 'nested-id', nested: { prop: 'NestedValue' }, mutable: false }],
    });
    const record = ds.getRecord('nested-id');

    expect(() => record?.set('nested.prop', 'UpdatedNestedValue')).toThrow('Cannot modify immutable record');
  });

  test('record remains immutable after serialization and deserialization', () => {
    const ds = dsm.add({
      id: 'testDs8',
      records: [{ id: 'id1', name: 'Name1', value: 100, mutable: false }],
    });
    const serialized = JSON.parse(JSON.stringify(ds.toJSON()));

    dsm.remove(ds.id as string);
    const newDs = dsm.add(serialized);

    const record = newDs.getRecord('id1');

    expect(() => record?.set('name', 'SerializedUpdate')).toThrow('Cannot modify immutable record');
    expect(record?.get('name')).toBe('Name1');
  });
});
