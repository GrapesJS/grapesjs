import { Component, DataRecord, DataSource, DataSourceManager, Editor } from '../../../../../src';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
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
import { ProjectData } from '../../../../../src/storage_manager';
import ComponentDataCollection from '../../../../../src/data_sources/model/data_collection/ComponentDataCollection';

describe('Collection component', () => {
  let em: EditorModel;
  let editor: Editor;
  let dsm: DataSourceManager;
  let dataSource: DataSource;
  let wrapper: Component;
  let firstRecord: DataRecord;
  let secondRecord: DataRecord;
  const records = [
    { id: 'user1', user: 'user1', firstName: 'Name1', age: '12' },
    { id: 'user2', user: 'user2', firstName: 'Name2', age: '14' },
    { id: 'user3', user: 'user3', firstName: 'Name3', age: '16' },
  ];

  beforeEach(() => {
    ({ em, editor, dsm } = setupTestEditor());
    wrapper = em.getWrapper()!;
    dataSource = dsm.add({
      id: 'my_data_source_id',
      records,
    });

    firstRecord = dataSource.getRecord('user1')!;
    secondRecord = dataSource.getRecord('user2')!;
  });

  afterEach(() => {
    em.destroy();
  });

  test('Collection component should be undroppable', () => {
    const cmpDef = {
      type: DataCollectionType,
      components: {
        type: DataCollectionItemType,
        components: {
          type: 'default',
        },
      },
      dataResolver: {
        collectionId: 'my_collection',
        dataSource: {
          type: DataVariableType,
          path: 'my_data_source_id',
        },
      },
    } as ComponentDataCollectionProps;
    const cmp = wrapper.components(cmpDef)[0];

    expect(cmp.get('droppable')).toBe(false);
  });

  test('Collection items should be undraggable and unremovable', () => {
    const cmpDef = {
      type: DataCollectionType,
      components: {
        type: DataCollectionItemType,
        components: {
          type: 'default',
        },
      },
      dataResolver: {
        collectionId: 'my_collection',
        dataSource: {
          type: DataVariableType,
          path: 'my_data_source_id',
        },
      },
    } as ComponentDataCollectionProps;
    const cmp = wrapper.components(cmpDef)[0];

    cmp.components().forEach((child) => {
      expect(child.get('draggable')).toBe(false);
      expect(child.get('removable')).toBe(false);
    });
  });

  describe('Collection variables', () => {
    describe('Properties', () => {
      let cmp: ComponentDataCollection;
      let firstChild!: Component;
      let firstGrandchild!: Component;
      let secondChild!: Component;
      let secondGrandchild!: Component;
      let thirdChild!: Component;

      const checkHtmlModelAndView = ({ cmp, innerHTML }: { cmp: Component; innerHTML: string }) => {
        const tagName = cmp.tagName;
        expect(cmp.getInnerHTML()).toBe(innerHTML);
        expect(cmp.toHTML()).toBe(`<${tagName} id="${cmp.getId()}">${innerHTML}</${tagName}>`);
        expect(cmp.getEl()?.innerHTML).toBe(innerHTML);
      };

      const checkRecordsWithInnerCmp = () => {
        dataSource.getRecords().forEach((record, i) => {
          const innerCmp = cmp.components().at(i).components().at(0).components().at(1);
          checkHtmlModelAndView({ cmp: innerCmp, innerHTML: record.get('firstName') });
        });
      };

      beforeEach(() => {
        const cmpDef = {
          type: DataCollectionType,
          components: {
            type: DataCollectionItemType,
            components: {
              type: 'default',
              components: [
                {
                  type: 'default',
                  name: {
                    type: DataVariableType,
                    variableType: DataCollectionStateType.currentItem,
                    collectionId: 'my_collection',
                    path: 'user',
                  },
                },
                {
                  tagName: 'span',
                  type: DataVariableType,
                  dataResolver: {
                    variableType: 'currentItem',
                    collectionId: 'my_collection',
                    path: 'firstName',
                  },
                },
              ],
              name: {
                type: DataVariableType,
                variableType: DataCollectionStateType.currentItem,
                collectionId: 'my_collection',
                path: 'user',
              },
              custom_property: {
                type: DataVariableType,
                variableType: DataCollectionStateType.currentItem,
                collectionId: 'my_collection',
                path: 'user',
              },
            },
          },
          dataResolver: {
            collectionId: 'my_collection',
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        } as ComponentDataCollectionProps;
        cmp = wrapper.components(cmpDef)[0] as unknown as ComponentDataCollection;

        firstChild = cmp.components().at(0).components().at(0);
        firstGrandchild = firstChild.components().at(0);
        secondChild = cmp.components().at(1).components().at(0);
        secondGrandchild = secondChild.components().at(0);
        thirdChild = cmp.components().at(2).components().at(0);
      });

      test('Evaluating to static value', () => {
        expect(firstChild.get('name')).toBe('user1');
        expect(firstChild.get('custom_property')).toBe('user1');
        expect(firstGrandchild.get('name')).toBe('user1');

        expect(secondChild.get('name')).toBe('user2');
        expect(secondChild.get('custom_property')).toBe('user2');
        expect(secondGrandchild.get('name')).toBe('user2');

        checkRecordsWithInnerCmp();
      });

      test('Watching Records', async () => {
        firstRecord.set('user', 'new_user1_value');
        expect(firstChild.get('name')).toBe('new_user1_value');
        expect(firstChild.get('custom_property')).toBe('new_user1_value');
        expect(firstGrandchild.get('name')).toBe('new_user1_value');

        expect(secondChild.get('name')).toBe('user2');
        expect(secondChild.get('custom_property')).toBe('user2');
        expect(secondGrandchild.get('name')).toBe('user2');

        const firstName = 'Name1-up';
        firstRecord.set({ firstName });
        checkRecordsWithInnerCmp();
      });

      test('Removing a record updates the collection component correctly', () => {
        dataSource.removeRecord('user1');

        expect(cmp.components().length).toBe(2);

        const updatedFirstChild = cmp.components().at(0).components().at(0);
        const updatedSecondChild = cmp.components().at(1).components().at(0);

        expect(updatedFirstChild.get('name')).toBe('user2');
        expect(updatedSecondChild.get('name')).toBe('user3');

        const updatedFirstGrandchild = updatedFirstChild.components().at(0);
        const updatedSecondGrandchild = updatedSecondChild.components().at(0);

        expect(updatedFirstGrandchild.get('name')).toBe('user2');
        expect(updatedSecondGrandchild.get('name')).toBe('user3');

        checkRecordsWithInnerCmp();
      });

      test('Adding a record updates the collection component correctly', () => {
        dataSource.addRecord({ id: 'user4', user: 'user4', firstName: 'Name4', age: '20' });

        expect(cmp.getItemsCount()).toBe(4);

        const newChild = cmp.components().at(3).components().at(0);
        expect(newChild.get('name')).toBe('user4');

        const newGrandchild = newChild.components().at(0);
        expect(newGrandchild.get('name')).toBe('user4');

        expect(firstChild.get('name')).toBe('user1');
        expect(secondChild.get('name')).toBe('user2');
        expect(thirdChild.get('name')).toBe('user3');

        checkRecordsWithInnerCmp();
      });

      test('Updating the value to a static value', async () => {
        firstChild.set('name', 'new_content_value');
        expect(firstChild.get('name')).toBe('new_content_value');
        expect(secondChild.get('name')).toBe('new_content_value');

        firstRecord.set('user', 'wrong_value');
        expect(firstChild.get('name')).toBe('new_content_value');
        expect(secondChild.get('name')).toBe('new_content_value');

        firstGrandchild.set('name', 'new_content_value');
        expect(firstGrandchild.get('name')).toBe('new_content_value');
        expect(secondGrandchild.get('name')).toBe('new_content_value');

        firstRecord.set('user', 'wrong_value');
        expect(firstGrandchild.get('name')).toBe('new_content_value');
        expect(secondGrandchild.get('name')).toBe('new_content_value');
      });

      test('Updating the value to a different collection variable', async () => {
        firstChild.set('name', {
          // @ts-ignore
          type: DataVariableType,
          variableType: DataCollectionStateType.currentItem,
          collectionId: 'my_collection',
          path: 'age',
        });
        expect(firstChild.get('name')).toBe('12');
        expect(secondChild.get('name')).toBe('14');

        firstRecord.set('age', 'new_value_12');
        secondRecord.set('age', 'new_value_14');

        firstRecord.set('user', 'wrong_value');
        secondRecord.set('user', 'wrong_value');

        expect(firstChild.get('name')).toBe('new_value_12');
        expect(secondChild.get('name')).toBe('new_value_14');

        firstGrandchild.set('name', {
          // @ts-ignore
          type: DataVariableType,
          variableType: DataCollectionStateType.currentItem,
          collectionId: 'my_collection',
          path: 'age',
        });
        expect(firstGrandchild.get('name')).toBe('new_value_12');
        expect(secondGrandchild.get('name')).toBe('new_value_14');

        firstRecord.set('age', 'most_new_value_12');
        secondRecord.set('age', 'most_new_value_14');

        expect(firstGrandchild.get('name')).toBe('most_new_value_12');
        expect(secondGrandchild.get('name')).toBe('most_new_value_14');
      });

      test('Updating the value to a different dynamic variable', async () => {
        firstChild.set('name', {
          // @ts-ignore
          type: DataVariableType,
          path: 'my_data_source_id.user2.user',
        });
        expect(firstChild.get('name')).toBe('user2');
        expect(secondChild.get('name')).toBe('user2');
        expect(thirdChild.get('name')).toBe('user2');

        secondRecord.set('user', 'new_value');
        expect(firstChild.get('name')).toBe('new_value');
        expect(secondChild.get('name')).toBe('new_value');
        expect(thirdChild.get('name')).toBe('new_value');

        firstGrandchild.set('name', {
          // @ts-ignore
          type: DataVariableType,
          path: 'my_data_source_id.user2.user',
        });
        expect(firstGrandchild.get('name')).toBe('new_value');
        expect(secondGrandchild.get('name')).toBe('new_value');

        secondRecord.set('user', 'most_new_value');

        expect(firstGrandchild.get('name')).toBe('most_new_value');
        expect(secondGrandchild.get('name')).toBe('most_new_value');
      });
    });

    describe('Attributes', () => {
      let cmp: Component;
      let firstChild!: Component;
      let firstGrandchild!: Component;
      let secondChild!: Component;
      let secondGrandchild!: Component;
      let thirdChild!: Component;

      beforeEach(() => {
        const cmpDef = {
          type: DataCollectionType,
          components: {
            type: DataCollectionItemType,
            components: {
              type: 'default',
              components: [
                {
                  type: 'default',
                  attributes: {
                    name: {
                      type: DataVariableType,
                      variableType: DataCollectionStateType.currentItem,
                      collectionId: 'my_collection',
                      path: 'user',
                    },
                  },
                },
              ],
              attributes: {
                name: {
                  type: DataVariableType,
                  variableType: DataCollectionStateType.currentItem,
                  collectionId: 'my_collection',
                  path: 'user',
                },
              },
            },
          },
          dataResolver: {
            collectionId: 'my_collection',
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        } as ComponentDataCollectionProps;
        cmp = wrapper.components(cmpDef)[0];

        firstChild = cmp.components().at(0).components().at(0);
        firstGrandchild = firstChild.components().at(0);
        secondChild = cmp.components().at(1).components().at(0);
        secondGrandchild = secondChild.components().at(0);
        thirdChild = cmp.components().at(2).components().at(0);
      });

      test('Evaluating to static value', () => {
        expect(firstChild.getAttributes()['name']).toBe('user1');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('user1');
        expect(firstGrandchild.getAttributes()['name']).toBe('user1');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('user1');

        expect(secondChild.getAttributes()['name']).toBe('user2');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('user2');
        expect(secondGrandchild.getAttributes()['name']).toBe('user2');
        expect(secondGrandchild.getEl()?.getAttribute('name')).toBe('user2');
      });

      test('Watching Records', async () => {
        firstRecord.set('user', 'new_user1_value');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_user1_value');
        expect(firstChild.getAttributes()['name']).toBe('new_user1_value');
        expect(firstGrandchild.getAttributes()['name']).toBe('new_user1_value');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('new_user1_value');

        expect(secondChild.getAttributes()['name']).toBe('user2');
        expect(secondGrandchild.getAttributes()['name']).toBe('user2');
      });

      test('Updating the value to a static value', async () => {
        firstChild.setAttributes({ name: 'new_content_value' });
        expect(firstChild.getAttributes()['name']).toBe('new_content_value');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_content_value');
        expect(secondChild.getAttributes()['name']).toBe('new_content_value');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('new_content_value');

        firstRecord.set('user', 'wrong_value');
        expect(firstChild.getAttributes()['name']).toBe('new_content_value');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_content_value');
        expect(secondChild.getAttributes()['name']).toBe('new_content_value');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('new_content_value');

        firstGrandchild.setAttributes({ name: 'new_content_value' });
        expect(firstGrandchild.getAttributes()['name']).toBe('new_content_value');
        expect(secondGrandchild.getAttributes()['name']).toBe('new_content_value');

        firstRecord.set('user', 'wrong_value');
        expect(firstGrandchild.getAttributes()['name']).toBe('new_content_value');
        expect(secondGrandchild.getAttributes()['name']).toBe('new_content_value');
      });

      test('Updating the value to a diffirent collection variable', async () => {
        firstChild.setAttributes({
          name: {
            // @ts-ignore
            type: DataVariableType,
            variableType: DataCollectionStateType.currentItem,
            collectionId: 'my_collection',
            path: 'age',
          },
        });
        expect(firstChild.getAttributes()['name']).toBe('12');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('12');
        expect(secondChild.getAttributes()['name']).toBe('14');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('14');

        firstRecord.set('age', 'new_value_12');
        secondRecord.set('age', 'new_value_14');

        firstRecord.set('user', 'wrong_value');
        secondRecord.set('user', 'wrong_value');

        expect(firstChild.getAttributes()['name']).toBe('new_value_12');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_value_12');
        expect(secondChild.getAttributes()['name']).toBe('new_value_14');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('new_value_14');

        firstGrandchild.setAttributes({
          name: {
            // @ts-ignore
            type: DataVariableType,
            variableType: DataCollectionStateType.currentItem,
            collectionId: 'my_collection',
            path: 'age',
          },
        });
        expect(firstGrandchild.getAttributes()['name']).toBe('new_value_12');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('new_value_12');
        expect(secondGrandchild.getAttributes()['name']).toBe('new_value_14');
        expect(secondGrandchild.getEl()?.getAttribute('name')).toBe('new_value_14');

        firstRecord.set('age', 'most_new_value_12');
        secondRecord.set('age', 'most_new_value_14');

        expect(firstGrandchild.getAttributes()['name']).toBe('most_new_value_12');
        expect(secondGrandchild.getAttributes()['name']).toBe('most_new_value_14');
      });

      test('Updating the value to a different dynamic variable', async () => {
        firstChild.setAttributes({
          name: {
            // @ts-ignore
            type: DataVariableType,
            path: 'my_data_source_id.user2.user',
          },
        });
        expect(firstChild.getAttributes()['name']).toBe('user2');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('user2');
        expect(secondChild.getAttributes()['name']).toBe('user2');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('user2');
        expect(thirdChild.getAttributes()['name']).toBe('user2');

        secondRecord.set('user', 'new_value');
        expect(firstChild.getAttributes()['name']).toBe('new_value');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_value');
        expect(secondChild.getAttributes()['name']).toBe('new_value');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('new_value');
        expect(thirdChild.getAttributes()['name']).toBe('new_value');

        firstGrandchild.setAttributes({
          name: {
            // @ts-ignore
            type: DataVariableType,
            path: 'my_data_source_id.user2.user',
          },
        });
        expect(firstGrandchild.getAttributes()['name']).toBe('new_value');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('new_value');
        expect(secondGrandchild.getAttributes()['name']).toBe('new_value');
        expect(secondGrandchild.getEl()?.getAttribute('name')).toBe('new_value');

        secondRecord.set('user', 'most_new_value');

        expect(firstGrandchild.getAttributes()['name']).toBe('most_new_value');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('most_new_value');
        expect(secondGrandchild.getAttributes()['name']).toBe('most_new_value');
        expect(secondGrandchild.getEl()?.getAttribute('name')).toBe('most_new_value');
      });
    });

    test('Traits', () => {
      const cmpDef = {
        type: DataCollectionType,
        components: {
          type: DataCollectionItemType,
          components: {
            type: 'default',
            traits: [
              {
                name: 'attribute_trait',
                value: {
                  type: DataVariableType,
                  variableType: DataCollectionStateType.currentItem,
                  collectionId: 'my_collection',
                  path: 'user',
                },
              },
              {
                name: 'property_trait',
                changeProp: true,
                value: {
                  type: DataVariableType,
                  variableType: DataCollectionStateType.currentItem,
                  collectionId: 'my_collection',
                  path: 'user',
                },
              },
            ],
          },
        },
        dataResolver: {
          collectionId: 'my_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      } as ComponentDataCollectionProps;
      const cmp = wrapper.components(cmpDef)[0] as unknown as ComponentDataCollection;

      expect(cmp.getItemsCount()).toBe(3);
      const firstChild = cmp.components().at(0).components().at(0);
      const secondChild = cmp.components().at(1).components().at(0);

      expect(firstChild.getAttributes()['attribute_trait']).toBe('user1');
      expect(firstChild.getEl()?.getAttribute('attribute_trait')).toBe('user1');
      expect(firstChild.get('property_trait')).toBe('user1');

      expect(secondChild.getAttributes()['attribute_trait']).toBe('user2');
      expect(secondChild.getEl()?.getAttribute('attribute_trait')).toBe('user2');
      expect(secondChild.get('property_trait')).toBe('user2');

      firstRecord.set('user', 'new_user1_value');
      expect(firstChild.getAttributes()['attribute_trait']).toBe('new_user1_value');
      expect(firstChild.getEl()?.getAttribute('attribute_trait')).toBe('new_user1_value');
      expect(firstChild.get('property_trait')).toBe('new_user1_value');

      expect(secondChild.getAttributes()['attribute_trait']).toBe('user2');
      expect(secondChild.getEl()?.getAttribute('attribute_trait')).toBe('user2');
      expect(secondChild.get('property_trait')).toBe('user2');
    });
  });

  describe('Serialization', () => {
    let cmp: ComponentDataCollection;

    beforeEach(() => {
      const childCmpDef = {
        type: 'default',
        name: {
          type: DataVariableType,
          variableType: DataCollectionStateType.currentItem,
          collectionId: 'my_collection',
          path: 'user',
        },
        custom_prop: {
          type: DataVariableType,
          variableType: DataCollectionStateType.currentIndex,
          collectionId: 'my_collection',
          path: 'user',
        },
        attributes: {
          name: {
            type: DataVariableType,
            variableType: DataCollectionStateType.currentItem,
            collectionId: 'my_collection',
            path: 'user',
          },
        },
        traits: [
          {
            name: 'attribute_trait',
            value: {
              type: DataVariableType,
              variableType: DataCollectionStateType.currentItem,
              collectionId: 'my_collection',
              path: 'user',
            },
          },
          {
            name: 'property_trait',
            changeProp: true,
            value: {
              type: DataVariableType,
              variableType: DataCollectionStateType.currentItem,
              collectionId: 'my_collection',
              path: 'user',
            },
          },
        ],
      };

      const collectionCmpDef = {
        type: DataCollectionType,
        components: [
          {
            type: DataCollectionItemType,
            components: [
              {
                ...childCmpDef,
                components: [childCmpDef, childCmpDef],
              },
            ],
          },
        ],
        dataResolver: {
          collectionId: 'my_collection',
          startIndex: 0,
          endIndex: 1,
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      } as ComponentDataCollectionProps;

      cmp = wrapper.components(collectionCmpDef)[0] as unknown as ComponentDataCollection;
    });

    test('Serializion with Collection Variables to JSON', () => {
      expect(cmp.toJSON()).toMatchSnapshot(`Collection with no grandchildren`);

      const firstItemCmp = cmp.getCollectionItemComponents().at(0);
      const newChildDefinition = {
        type: 'default',
        name: {
          type: DataVariableType,
          variableType: DataCollectionStateType.currentIndex,
          collectionId: 'my_collection',
          path: 'user',
        },
      };
      firstItemCmp.components().at(0).components(newChildDefinition);
      expect(cmp.toJSON()).toMatchSnapshot(`Collection with grandchildren`);
    });

    test('Saving', () => {
      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0] as ComponentDataCollection;

      expect(component).toMatchSnapshot(`Collection with no grandchildren`);

      const firstItemCmp = cmp.getCollectionItemComponents().at(0);
      const newChildDefinition = {
        type: 'default',
        name: {
          type: DataVariableType,
          variableType: DataCollectionStateType.currentIndex,
          collectionId: 'my_collection',
          path: 'user',
        },
      };
      firstItemCmp.components(newChildDefinition);
      expect(cmp.toJSON()).toMatchSnapshot(`Collection with grandchildren`);
    });

    test('Loading', () => {
      const cmpDef = {
        type: DataCollectionType,
        components: [
          {
            type: DataCollectionItemType,
            components: {
              attributes: {
                attribute_trait: {
                  path: 'user',
                  type: DataVariableType,
                  variableType: DataCollectionStateType.currentItem,
                },
                name: {
                  path: 'user',
                  type: DataVariableType,
                  collectionId: 'my_collection',
                  variableType: DataCollectionStateType.currentItem,
                },
              },
              components: [
                {
                  attributes: {
                    attribute_trait: {
                      path: 'user',
                      type: DataVariableType,
                      collectionId: 'my_collection',
                      variableType: DataCollectionStateType.currentItem,
                    },
                    name: {
                      path: 'user',
                      type: DataVariableType,
                      collectionId: 'my_collection',
                      variableType: DataCollectionStateType.currentItem,
                    },
                  },
                  name: {
                    path: 'user',
                    type: DataVariableType,
                    collectionId: 'my_collection',
                    variableType: DataCollectionStateType.currentItem,
                  },
                  custom_prop: {
                    path: 'user',
                    type: DataVariableType,
                    collectionId: 'my_collection',
                    variableType: 'currentIndex',
                  },
                  property_trait: {
                    path: 'user',
                    type: DataVariableType,
                    collectionId: 'my_collection',
                    variableType: DataCollectionStateType.currentItem,
                  },
                  type: 'default',
                },
                {
                  attributes: {
                    attribute_trait: {
                      path: 'user',
                      type: DataVariableType,
                      collectionId: 'my_collection',
                      variableType: DataCollectionStateType.currentItem,
                    },
                    name: {
                      path: 'user',
                      type: DataVariableType,
                      collectionId: 'my_collection',
                      variableType: DataCollectionStateType.currentItem,
                    },
                  },
                  name: {
                    path: 'user',
                    type: DataVariableType,
                    collectionId: 'my_collection',
                    variableType: DataCollectionStateType.currentItem,
                  },
                  custom_prop: {
                    path: 'user',
                    type: DataVariableType,
                    collectionId: 'my_collection',
                    variableType: 'currentIndex',
                  },
                  property_trait: {
                    path: 'user',
                    type: DataVariableType,
                    collectionId: 'my_collection',
                    variableType: DataCollectionStateType.currentItem,
                  },
                  type: 'default',
                },
              ],
              name: {
                path: 'user',
                type: DataVariableType,
                collectionId: 'my_collection',
                variableType: DataCollectionStateType.currentItem,
              },
              custom_prop: {
                path: 'user',
                type: DataVariableType,
                collectionId: 'my_collection',
                variableType: 'currentIndex',
              },
              property_trait: {
                path: 'user',
                type: DataVariableType,
                collectionId: 'my_collection',
                variableType: DataCollectionStateType.currentItem,
              },
              type: 'default',
            },
          },
        ],
        dataResolver: {
          collectionId: 'my_collection',
          dataSource: {
            path: 'my_data_source_id',
            type: DataVariableType,
          },
          endIndex: 1,
          startIndex: 0,
        },
      } as ComponentDataCollectionProps;

      const componentProjectData: ProjectData = {
        assets: [],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [cmpDef],
                  docEl: {
                    tagName: 'html',
                  },
                  head: {
                    type: 'head',
                  },
                  stylable: [
                    'background',
                    'background-color',
                    'background-image',
                    'background-repeat',
                    'background-attachment',
                    'background-position',
                    'background-size',
                  ],
                  type: 'wrapper',
                },
                id: 'frameid',
              },
            ],
            id: 'pageid',
            type: 'main',
          },
        ],
        styles: [],
        symbols: [],
        dataSources: [dataSource],
      };
      editor.loadProjectData(componentProjectData);

      const components = editor.getComponents();
      const component = components.models[0] as ComponentDataCollection;
      const firstChild = component.components().at(0).components().at(0);
      const firstGrandchild = firstChild.components().at(0);
      const secondChild = component.components().at(1).components().at(0);
      const secondGrandchild = secondChild.components().at(0);

      expect(firstChild.get('name')).toBe('user1');
      expect(firstChild.getAttributes()['name']).toBe('user1');
      expect(firstGrandchild.get('name')).toBe('user1');
      expect(firstGrandchild.getAttributes()['name']).toBe('user1');

      expect(secondChild.get('name')).toBe('user2');
      expect(secondChild.getAttributes()['name']).toBe('user2');
      expect(secondGrandchild.get('name')).toBe('user2');
      expect(secondGrandchild.getAttributes()['name']).toBe('user2');

      firstRecord.set('user', 'new_user1_value');
      expect(firstChild.get('name')).toBe('new_user1_value');
      expect(firstChild.getAttributes()['name']).toBe('new_user1_value');
      expect(firstGrandchild.get('name')).toBe('new_user1_value');
      expect(firstGrandchild.getAttributes()['name']).toBe('new_user1_value');

      expect(secondChild.get('name')).toBe('user2');
      expect(secondChild.getAttributes()['name']).toBe('user2');
      expect(secondGrandchild.get('name')).toBe('user2');
      expect(secondGrandchild.getAttributes()['name']).toBe('user2');
    });
  });

  describe('Configuration options', () => {
    test('Collection with start and end indexes', () => {
      const cmpDef = {
        type: DataCollectionType,
        components: {
          type: DataCollectionItemType,
          components: {
            type: 'default',
            name: {
              type: DataVariableType,
              variableType: DataCollectionStateType.currentItem,
              collectionId: 'my_collection',
              path: 'user',
            },
          },
        },
        dataResolver: {
          startIndex: 1,
          endIndex: 2,
          collectionId: 'my_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      } as ComponentDataCollectionProps;
      const cmp = wrapper.components(cmpDef)[0] as unknown as ComponentDataCollection;

      expect(cmp.components()).toHaveLength(2);
      const firstChild = cmp.components().at(0).components().at(0);
      const secondChild = cmp.components().at(1).components().at(0);

      expect(firstChild.get('name')).toBe('user2');
      expect(secondChild.get('name')).toBe('user3');
    });
  });

  describe('State Variable Comprehensive Tests', () => {
    const stateVariableTests = {
      [DataCollectionStateType.currentIndex]: {
        expectedValues: [0, 1, 2],
        expectedObjectPathValue: [0, 1, 2, 3],
      },
      [DataCollectionStateType.startIndex]: {
        expectedValues: [0, 0, 0],
        expectedObjectPathValue: [0, 0, 0, 0],
      },
      [DataCollectionStateType.endIndex]: {
        expectedValues: [2, 2, 2],
        expectedObjectPathValue: [3, 3, 3, 3],
      },
      [DataCollectionStateType.currentKey]: {
        expectedValues: [0, 1, 2],
        expectedObjectPathValue: ['id', 'user', 'firstName', 'age'],
      },
      [DataCollectionStateType.currentItem]: {
        expectedValues: null,
        expectedObjectPathValue: ['user1', 'user1', 'Name1', '12'],
      },
      [DataCollectionStateType.collectionId]: {
        expectedValues: ['my_collection', 'my_collection', 'my_collection'],
        expectedObjectPathValue: ['my_collection', 'my_collection', 'my_collection', 'my_collection'],
      },
      [DataCollectionStateType.totalItems]: {
        expectedValues: [3, 3, 3],
        expectedObjectPathValue: [4, 4, 4, 4],
      },
      [DataCollectionStateType.remainingItems]: {
        expectedValues: [2, 1, 0],
        expectedObjectPathValue: [3, 2, 1, 0],
      },
    };

    const createCollectionCmpDef = (variableType: string, collectionId: string, dataSourcePath: string) => {
      return {
        type: DataCollectionType,
        components: {
          type: DataCollectionItemType,
          components: {
            type: 'default',
            name: {
              type: DataVariableType,
              variableType: variableType,
              collectionId: collectionId,
            },
            attributes: {
              custom_attribute: {
                type: DataVariableType,
                variableType: variableType,
                collectionId: collectionId,
              },
            },
            traits: [
              {
                name: 'attribute_trait',
                value: {
                  type: DataVariableType,
                  variableType: variableType,
                  collectionId: collectionId,
                },
              },
              {
                name: 'property_trait',
                changeProp: true,
                value: {
                  type: DataVariableType,
                  variableType: variableType,
                  collectionId: collectionId,
                },
              },
            ],
          },
        },
        dataResolver: {
          collectionId: collectionId,
          dataSource: {
            type: DataVariableType,
            path: dataSourcePath,
          },
        },
      };
    };

    const performStateVariableAssertions = (
      cmp: ComponentDataCollection,
      expectedAssertValues: (string | number)[] | null,
    ) => {
      if (!expectedAssertValues) return;
      const children = cmp.components();
      children.each((child, index) => {
        const content = child.components().at(0);
        expect(content.get('name')).toBe(expectedAssertValues[index]);
        expect(content.get('property_trait')).toBe(expectedAssertValues[index]);
        expect(content.getAttributes()['custom_attribute']).toBe(expectedAssertValues[index]);
        expect(content.getAttributes()['attribute_trait']).toBe(expectedAssertValues[index]);
      });
    };

    Object.entries(stateVariableTests).forEach(([variableType, { expectedValues, expectedObjectPathValue }]) => {
      test(`Variable type: ${variableType} - Standard Path`, () => {
        const cmpDef = createCollectionCmpDef(
          variableType,
          'my_collection',
          'my_data_source_id',
        ) as ComponentDataCollectionProps;
        const cmp = wrapper.components(cmpDef)[0] as unknown as ComponentDataCollection;
        performStateVariableAssertions(cmp, expectedValues);
      });

      test(`Variable type: ${variableType} - Object Path (my_data_source_id.user1)`, () => {
        const cmpDef = createCollectionCmpDef(
          variableType,
          'my_collection',
          'my_data_source_id.user1',
        ) as ComponentDataCollectionProps;
        const cmp = wrapper.components(cmpDef)[0] as unknown as ComponentDataCollection;
        performStateVariableAssertions(cmp, expectedObjectPathValue);
      });
    });
  });
});
