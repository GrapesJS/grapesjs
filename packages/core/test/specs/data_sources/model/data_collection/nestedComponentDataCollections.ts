import { Component, DataRecord, DataSource, DataSourceManager, Editor } from '../../../../../src';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import ComponentDataCollection from '../../../../../src/data_sources/model/data_collection/ComponentDataCollection';
import {
  DataCollectionItemType,
  DataCollectionType,
} from '../../../../../src/data_sources/model/data_collection/constants';
import {
  ComponentDataCollectionProps,
  DataCollectionStateType,
} from '../../../../../src/data_sources/model/data_collection/types';
import EditorModel from '../../../../../src/editor/model/Editor';
import { setupTestEditor } from '../../../../common';

describe('Collection component', () => {
  let em: EditorModel;
  let dsm: DataSourceManager;
  let dataSource: DataSource;
  let nestedDataSource: DataSource;
  let wrapper: Component;
  let firstRecord: DataRecord;
  let firstNestedRecord: DataRecord;
  let cmpDef: ComponentDataCollectionProps | undefined;
  let nestedCmpDef: ComponentDataCollectionProps | undefined;
  let parentCmp: ComponentDataCollection;
  let nestedCmp: ComponentDataCollection;

  function getCmpDef(nestedCmpDef: ComponentDataCollectionProps): ComponentDataCollectionProps {
    return {
      type: DataCollectionType,
      components: { type: DataCollectionItemType, components: nestedCmpDef },
      dataResolver: {
        collectionId: 'parent_collection',
        dataSource: {
          type: DataVariableType,
          path: 'my_data_source_id',
        },
      },
    };
  }

  beforeEach(() => {
    ({ em, dsm } = setupTestEditor());
    wrapper = em.getWrapper()!;
    dataSource = dsm.add({
      id: 'my_data_source_id',
      records: [
        { id: 'user1', user: 'user1', age: '12' },
        { id: 'user2', user: 'user2', age: '14' },
      ],
    });

    nestedDataSource = dsm.add({
      id: 'nested_data_source_id',
      records: [
        { id: 'nested_user1', user: 'nested_user1', age: '12' },
        { id: 'nested_user2', user: 'nested_user2', age: '14' },
        { id: 'nested_user3', user: 'nested_user3', age: '16' },
      ],
    });

    firstRecord = dataSource.getRecord('user1')!;
    firstNestedRecord = nestedDataSource.getRecord('nested_user1')!;

    nestedCmpDef = {
      type: DataCollectionType,
      components: {
        type: DataCollectionItemType,
        components: {
          type: 'default',
          name: {
            type: DataVariableType,
            variableType: DataCollectionStateType.currentItem,
            collectionId: 'nested_collection',
            path: 'user',
          },
        },
      },
      dataResolver: {
        collectionId: 'nested_collection',
        dataSource: {
          type: DataVariableType,
          path: 'nested_data_source_id',
        },
      },
    };

    cmpDef = getCmpDef(nestedCmpDef);

    parentCmp = wrapper.components(cmpDef)[0] as unknown as ComponentDataCollection;
    nestedCmp = parentCmp.getCollectionItemComponents().at(0) as ComponentDataCollection;
  });

  afterEach(() => {
    em.destroy();
    nestedCmpDef = undefined;
    cmpDef = undefined;
  });

  test('Nested collections bind to correct data sources', () => {
    const nestedFirstChild = nestedCmp.components().at(0).components().at(0);
    const nestedSecondChild = nestedCmp.components().at(1).components().at(0);

    expect(nestedFirstChild.get('name')).toBe('nested_user1');
    expect(nestedSecondChild.get('name')).toBe('nested_user2');
  });

  test('Updates in parent collection propagate to nested collections', () => {
    const nestedFirstChild = nestedCmp.components().at(0).components().at(0);
    const nestedSecondChild = nestedCmp.components().at(1).components().at(0);

    firstNestedRecord.set('user', 'updated_user1');
    expect(nestedFirstChild.get('name')).toBe('updated_user1');
    expect(nestedSecondChild.get('name')).toBe('nested_user2');
  });

  test('Nested collections are correctly serialized', () => {
    const serialized = parentCmp.toJSON();
    expect(serialized).toMatchSnapshot();
  });

  test('Nested collections respect startIndex and endIndex', () => {
    nestedCmpDef = {
      type: DataCollectionType,
      components: {
        type: DataCollectionItemType,
        components: {
          type: 'default',
          name: {
            type: DataVariableType,
            variableType: DataCollectionStateType.currentItem,
            collectionId: 'nested_collection',
            path: 'user',
          },
        },
      },
      dataResolver: {
        collectionId: 'nested_collection',
        startIndex: 0,
        endIndex: 1,
        dataSource: {
          type: DataVariableType,
          path: 'nested_data_source_id',
        },
      },
    };

    const updatedParentCmp = wrapper.components(getCmpDef(nestedCmpDef))[0] as unknown as ComponentDataCollection;
    const updatedNestedCmp = updatedParentCmp.getCollectionItemComponents().at(0) as ComponentDataCollection;
    expect(updatedNestedCmp.getItemsCount()).toBe(2);
  });

  test('Nested collection gets and watches value from the parent collection', () => {
    nestedCmpDef = {
      type: DataCollectionType,
      components: {
        type: DataCollectionItemType,
        components: {
          type: 'default',
          name: {
            type: DataVariableType,
            variableType: DataCollectionStateType.currentItem,
            collectionId: 'parent_collection',
            path: 'user',
          },
        },
      },
      dataResolver: {
        collectionId: 'nested_collection',
        startIndex: 0,
        endIndex: 1,
        dataSource: {
          type: DataVariableType,
          path: 'nested_data_source_id',
        },
      },
    };

    const updatedParentCmp = wrapper.components(getCmpDef(nestedCmpDef))[0] as unknown as ComponentDataCollection;
    const updatedNestedCmp = updatedParentCmp.getCollectionItemComponents().at(0) as ComponentDataCollection;
    const firstNestedChild = updatedNestedCmp.getCollectionItemComponents().at(0);

    expect(firstNestedChild.get('name')).toBe('user1');
    firstRecord.set('user', 'updated_user1');
    expect(firstNestedChild.get('name')).toBe('updated_user1');
  });

  test('Nested collection switches to using its own collection variable', () => {
    const firstChild = nestedCmp.components().at(0).components().at(0);

    firstChild.set('name', {
      // @ts-ignore
      type: DataVariableType,
      variableType: DataCollectionStateType.currentItem,
      path: 'user',
      collectionId: 'nested_collection',
    });

    expect(firstChild.get('name')).toBe('nested_user1');
  });

  describe('Nested Collection Component with Parent and Nested Data Sources', () => {
    beforeEach(() => {
      nestedCmpDef = {
        type: DataCollectionType,
        name: {
          type: DataVariableType,
          variableType: DataCollectionStateType.currentItem,
          collectionId: 'parent_collection',
          path: 'user',
        },
        components: {
          type: DataCollectionItemType,
          components: {
            type: 'default',
            name: {
              type: DataVariableType,
              variableType: DataCollectionStateType.currentItem,
              collectionId: 'nested_collection',
              path: 'user',
            },
          },
        },
        dataResolver: {
          collectionId: 'nested_collection',
          dataSource: {
            type: DataVariableType,
            path: 'nested_data_source_id',
          },
        },
      };

      parentCmp = wrapper.components(getCmpDef(nestedCmpDef))[0] as unknown as ComponentDataCollection;
      nestedCmp = parentCmp.getCollectionItemComponents().at(0) as ComponentDataCollection;
    });

    test('Removing a record from the parent data source updates the parent collection correctly', () => {
      expect(parentCmp.getItemsCount()).toBe(2);
      dataSource.removeRecord('user1');
      expect(parentCmp.getItemsCount()).toBe(1);
      expect(parentCmp.components().at(0).components().at(0).get('name')).toBe('user2');
      expect(nestedCmp.getItemsCount()).toBe(3);
      expect(nestedCmp.components().at(0).components().at(0).get('name')).toBe('nested_user1');
    });

    test('Adding a record to the parent data source updates the parent collection correctly', () => {
      expect(parentCmp.getItemsCount()).toBe(2);
      dataSource.addRecord({ id: 'user3', user: 'user3', age: '16' });
      expect(parentCmp.getItemsCount()).toBe(3);
      expect(parentCmp.components().at(2).components().at(0).get('name')).toBe('user3');
      expect(nestedCmp.getItemsCount()).toBe(3);
      expect(nestedCmp.components().at(0).components().at(0).get('name')).toBe('nested_user1');
    });

    test('Removing a record from the nested data source updates the nested collection correctly', () => {
      expect(nestedCmp.getItemsCount()).toBe(3);
      nestedDataSource.removeRecord('nested_user1');
      expect(nestedCmp.getItemsCount()).toBe(2);
      expect(nestedCmp.components().at(0).components().at(0).get('name')).toBe('nested_user2');
      expect(nestedCmp.components().at(1).components().at(0).get('name')).toBe('nested_user3');
    });

    test('Adding a record to the nested data source updates the nested collection correctly', () => {
      expect(nestedCmp.getItemsCount()).toBe(3);
      expect(nestedCmp.components().at(0).components().at(0).get('name')).toBe('nested_user1');
      expect(nestedCmp.components().at(1).components().at(0).get('name')).toBe('nested_user2');
      expect(nestedCmp.components().at(2).components().at(0).get('name')).toBe('nested_user3');

      nestedDataSource.addRecord({ id: 'user4', user: 'nested_user4', age: '18' });
      expect(nestedCmp.getItemsCount()).toBe(4);
      expect(nestedCmp.components().at(3).components().at(0).get('name')).toBe('nested_user4');
      expect(nestedCmp.components().at(0).components().at(0).get('name')).toBe('nested_user1');
      expect(nestedCmp.components().at(1).components().at(0).get('name')).toBe('nested_user2');
      expect(nestedCmp.components().at(2).components().at(0).get('name')).toBe('nested_user3');
    });
  });
});
