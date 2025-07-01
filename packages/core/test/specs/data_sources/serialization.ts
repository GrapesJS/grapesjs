import Editor from '../../../src/editor';
import DataSourceManager from '../../../src/data_sources';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import EditorModel from '../../../src/editor/model/Editor';
import { ProjectData } from '../../../src/storage_manager';
import { filterObjectForSnapshot, setupTestEditor } from '../../common';
describe('DataSource Serialization', () => {
  let editor: Editor;
  let em: EditorModel;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;
  const componentDataSource = {
    id: 'component-serialization',
    records: [
      { id: 'id1', content: 'Hello World' },
      { id: 'id2', color: 'red' },
    ],
    skipFromStorage: true,
  };
  const styleDataSource = {
    id: 'colors-data',
    records: [{ id: 'id1', color: 'red' }],
    skipFromStorage: true,
  };
  const traitDataSource = {
    id: 'test-input',
    records: [{ id: 'id1', value: 'test-value' }],
    skipFromStorage: true,
  };
  const propsDataSource = {
    id: 'test-input',
    records: [{ id: 'id1', value: 'test-value' }],
    skipFromStorage: true,
  };

  beforeEach(() => {
    ({ editor, em, dsm, cmpRoot } = setupTestEditor());

    dsm.add(componentDataSource);
    dsm.add(styleDataSource);
    dsm.add(traitDataSource);
  });

  afterEach(() => {
    em.destroy();
  });

  test('component .getHtml', () => {
    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      components: [
        {
          type: DataVariableType,
          dataResolver: { defaultValue: 'default', path: `${componentDataSource.id}.id1.content` },
        },
      ],
    })[0];

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('Hello World');

    const html = em.getHtml();
    expect(html).toMatchInlineSnapshot('"<body><h1><div>Hello World</div></h1></body>"');
  });

  describe('.getProjectData', () => {
    test('Dynamic Props', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${propsDataSource.id}.id1.value`,
      };

      cmpRoot.append({
        tagName: 'input',
        content: dataVariable,
        customProp: dataVariable,
      })[0];

      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];
      expect(component['content']).toEqual(dataVariable);
      expect(component['customProp']).toEqual(dataVariable);

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });

    test('Dynamic Attributes', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${propsDataSource.id}.id1.value`,
      };

      cmpRoot.append({
        tagName: 'input',
        attributes: {
          dynamicAttribute: dataVariable,
        },
      })[0];

      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];
      expect(component['attributes']['dynamicAttribute']).toEqual(dataVariable);

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });

    test('ComponentDataVariable', () => {
      const dataVariable = {
        type: DataVariableType,
        dataResolver: { defaultValue: 'default', path: `${componentDataSource.id}.id1.content` },
      };

      cmpRoot.append({
        tagName: 'h1',
        type: 'text',
        components: [dataVariable],
      })[0];

      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];
      expect(component.components[0]).toEqual(dataVariable);

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });

    test('StyleDataVariable', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'black',
        path: 'colors-data.id1.color',
      };

      cmpRoot.append({
        tagName: 'h1',
        type: 'text',
        content: 'Hello World',
        style: {
          color: dataVariable,
        },
      })[0];

      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];
      const componentId = component.attributes.id;
      expect(componentId).toBeDefined();

      const styleSelector = projectData.styles.find((style: any) => style.selectors[0] === `#${componentId}`);
      expect(styleSelector.style).toEqual({
        color: dataVariable,
      });

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });
  });

  describe('.loadProjectData', () => {
    test('Dynamic Props', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${propsDataSource.id}.id1.value`,
      };

      const componentProjectData: ProjectData = {
        assets: [],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      content: dataVariable,
                      customProp: dataVariable,
                      tagName: 'input',
                      void: true,
                    },
                  ],
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
        dataSources: [propsDataSource],
      };

      editor.loadProjectData(componentProjectData);

      const components = editor.getComponents();
      const component = components.models[0];
      expect(component.get('content')).toEqual('test-value');
      expect(component.get('customProp')).toEqual('test-value');

      dsm.get(propsDataSource.id).getRecord('id1')?.set('value', 'updated-value');
      expect(component.get('content')).toEqual('updated-value');
      expect(component.get('customProp')).toEqual('updated-value');
    });

    test('Dynamic Attributes', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${propsDataSource.id}.id1.value`,
      };

      const componentProjectData: ProjectData = {
        assets: [],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      attributes: {
                        dynamicAttribute: dataVariable,
                      },
                      tagName: 'input',
                      void: true,
                    },
                  ],
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
        dataSources: [propsDataSource],
      };

      editor.loadProjectData(componentProjectData);

      const components = editor.getComponents();
      const component = components.at(0);
      expect(component.getAttributes()['dynamicAttribute']).toEqual('test-value');

      dsm.get(propsDataSource.id).getRecord('id1')?.set('value', 'updated-value');
      expect(component.getAttributes()['dynamicAttribute']).toEqual('updated-value');
    });

    test('ComponentDataVariable', () => {
      const componentProjectData: ProjectData = {
        assets: [],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      components: [
                        {
                          value: 'default',
                          type: DataVariableType,
                          dataResolver: { path: 'component-serialization.id1.content' },
                        },
                      ],
                      tagName: 'h1',
                      type: 'text',
                    },
                  ],
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
                id: 'data-variable-id',
              },
            ],
            id: 'data-variable-id',
            type: 'main',
          },
        ],
        styles: [],
        symbols: [],
        dataSources: [componentDataSource],
      };

      editor.loadProjectData(componentProjectData);
      const components = editor.getComponents();

      const component = components.models[0];
      const html = component.toHTML();
      expect(html).toContain('Hello World');
    });

    test('StyleDataVariable', () => {
      const componentProjectData: ProjectData = {
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      attributes: {
                        id: 'selectorid',
                      },
                      content: 'Hello World',
                      tagName: 'h1',
                      type: 'text',
                    },
                  ],
                },
              },
            ],
          },
        ],
        styles: [
          {
            selectors: ['#selectorid'],
            style: {
              color: {
                path: 'colors-data.id1.color',
                type: DataVariableType,
                defaultValue: 'black',
              },
            },
          },
        ],
        dataSources: [styleDataSource],
      };

      editor.loadProjectData(componentProjectData);

      const component = editor.getComponents().models[0];
      const style = component.getStyle();
      expect(style).toEqual({ color: 'red' });

      // Further validation: ensure the style updates when the data source changes
      const loadedDsm = editor.DataSources;
      const colorsDatasource = loadedDsm.get('colors-data');
      colorsDatasource.getRecord('id1')?.set({ color: 'blue' });

      const updatedStyle = component.getStyle();
      expect(updatedStyle).toEqual({ color: 'blue' });
      const unresolvedStyle = component.getStyle({ skipResolve: true });
      expect(unresolvedStyle).toEqual({
        color: {
          path: 'colors-data.id1.color',
          type: DataVariableType,
          defaultValue: 'black',
        },
      });
    });

    test('should resolve styles, props, and attributes if the entire datasource is added after load', () => {
      const styleVar = {
        type: DataVariableType,
        defaultValue: 'black',
        path: 'new-unified-data.styleRecord.color',
      };
      const propAttrVar = {
        type: DataVariableType,
        defaultValue: 'default-value',
        path: 'new-unified-data.propRecord.value',
      };

      const componentProjectData: ProjectData = {
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      attributes: { id: 'selectorid', 'data-test': propAttrVar },
                      tagName: 'div',
                      customProp: propAttrVar,
                    },
                  ],
                },
              },
            ],
          },
        ],
        styles: [{ selectors: ['#selectorid'], style: { color: styleVar } }],
        dataSources: [], // Start with no datasources
      };

      editor.loadProjectData(componentProjectData);
      const component = editor.getComponents().at(0); // Assert fallback to defaults before adding the data source

      expect(component.getStyle()).toEqual({ color: 'black' });
      expect(component.get('customProp')).toBe('default-value');
      expect(component.getAttributes()['data-test']).toBe('default-value');

      editor.DataSources.add({
        id: 'new-unified-data',
        records: [
          { id: 'styleRecord', color: 'green' },
          { id: 'propRecord', value: 'resolved-value' },
        ],
      });

      expect(component.getStyle()).toEqual({ color: 'green' });
      expect(component.get('customProp')).toBe('resolved-value');
      expect(component.getAttributes()['data-test']).toBe('resolved-value');
    });

    test('should resolve styles, props, and attributes if a record is added to an existing datasource after load', () => {
      const styleVar = {
        type: DataVariableType,
        defaultValue: 'black',
        path: 'unified-source.newStyleRecord.color',
      };
      const propAttrVar = {
        type: DataVariableType,
        defaultValue: 'default-value',
        path: 'unified-source.newPropRecord.value',
      };

      const componentProjectData: ProjectData = {
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      attributes: { id: 'selectorid', 'data-test': propAttrVar },
                      tagName: 'div',
                      customProp: propAttrVar,
                    },
                  ],
                },
              },
            ],
          },
        ],
        styles: [{ selectors: ['#selectorid'], style: { color: styleVar } }],
        dataSources: [{ id: 'unified-source', records: [] }], // Data source exists but is empty
      };

      editor.loadProjectData(componentProjectData);
      const component = editor.getComponents().at(0); // Assert fallback to defaults because records are missing

      expect(component.getStyle()).toEqual({ color: 'black' });
      expect(component.get('customProp')).toBe('default-value');
      expect(component.getAttributes()['data-test']).toBe('default-value');

      const ds = editor.DataSources.get('unified-source');
      ds?.addRecord({ id: 'newStyleRecord', color: 'purple' });
      ds?.addRecord({ id: 'newPropRecord', value: 'resolved-record-value' });

      expect(component.getStyle()).toEqual({ color: 'purple' });
      expect(component.get('customProp')).toBe('resolved-record-value');
      expect(component.getAttributes()['data-test']).toBe('resolved-record-value');
    });
  });
});
