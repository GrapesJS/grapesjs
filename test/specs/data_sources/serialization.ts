import Editor from '../../../src/editor';
import DataSourceManager from '../../../src/data_sources';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import EditorModel from '../../../src/editor/model/Editor';
import { ProjectData } from '../../../src/storage_manager';
import { DataSourceProps } from '../../../src/data_sources/types';

// Filter out the unique ids and selectors replaced with 'data-variable-id'
// Makes the snapshot more stable
function filterObjectForSnapshot(obj: any, parentKey: string = ''): any {
  const result: any = {};

  for (const key in obj) {
    if (key === 'id') {
      result[key] = 'data-variable-id';
      continue;
    }

    if (key === 'selectors') {
      result[key] = obj[key].map(() => 'data-variable-id');
      continue;
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        result[key] = obj[key].map((item: any) =>
          typeof item === 'object' ? filterObjectForSnapshot(item, key) : item,
        );
      } else {
        result[key] = filterObjectForSnapshot(obj[key], key);
      }
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}

describe('DataSource Serialization', () => {
  let editor: Editor;
  let em: EditorModel;
  let dsm: DataSourceManager;
  let fixtures: HTMLElement;
  let cmpRoot: ComponentWrapper;
  const componentDataSource: DataSourceProps = {
    id: 'component-serialization',
    records: [
      { id: 'id1', content: 'Hello World' },
      { id: 'id2', color: 'red' },
    ],
  };
  const styleDataSource: DataSourceProps = {
    id: 'colors-data',
    records: [{ id: 'id1', color: 'red' }],
  };
  const traitDataSource: DataSourceProps = {
    id: 'test-input',
    records: [{ id: 'id1', value: 'test-value' }],
  };

  beforeEach(() => {
    editor = new Editor({
      mediaCondition: 'max-width',
      avoidInlineStyle: true,
    });
    em = editor.getModel();
    dsm = em.DataSources;
    document.body.innerHTML = '<div id="fixtures"></div>';
    const { Pages, Components } = em;
    Pages.onLoad();
    cmpRoot = Components.getWrapper()!;
    const View = Components.getType('wrapper')!.view;
    const wrapperEl = new View({
      model: cmpRoot,
      config: { ...cmpRoot.config, em },
    });
    wrapperEl.render();
    fixtures = document.body.querySelector('#fixtures')!;
    fixtures.appendChild(wrapperEl.el);

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
          defaultValue: 'default',
          path: `${componentDataSource.id}.id1.content`,
        },
      ],
    })[0];

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('Hello World');

    const html = em.getHtml();
    expect(html).toMatchInlineSnapshot('"<body><h1><div>Hello World</div></h1></body>"');
  });

  describe('.getProjectData', () => {
    test('ComponentDataVariable', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${componentDataSource.id}.id1.content`,
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

    test('TraitDataVariable', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${traitDataSource.id}.id1.value`,
      };

      cmpRoot.append({
        tagName: 'input',
        traits: [
          'name',
          {
            type: 'text',
            label: 'Value',
            name: 'value',
            value: dataVariable,
          },
        ],
      })[0];

      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];
      expect(component).toHaveProperty('attributes-data-variable');
      expect(component['attributes-data-variable']).toEqual({
        value: dataVariable,
      });
      expect(component.attributes).toEqual({
        value: 'test-value',
      });

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });
  });

  describe('.loadProjectData', () => {
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
                          path: 'component-serialization.id1.content',
                          type: 'data-variable',
                          value: 'default',
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
      };

      editor.loadProjectData(componentProjectData);
      const components = editor.getComponents();

      const component = components.models[0];
      const html = component.toHTML();
      expect(html).toContain('Hello World');
    });

    test('StyleDataVariable', () => {
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
                        id: 'selectorid',
                      },
                      content: 'Hello World',
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
                id: 'componentid',
              },
            ],
            id: 'frameid',
            type: 'main',
          },
        ],
        styles: [
          {
            selectors: ['#selectorid'],
            style: {
              color: {
                path: 'colors-data.id1.color',
                type: 'data-variable',
                defaultValue: 'black',
              },
            },
          },
        ],
        symbols: [],
      };

      editor.loadProjectData(componentProjectData);

      const components = editor.getComponents();
      const component = components.models[0];
      const style = component.getStyle();

      expect(style).toEqual({
        color: 'red',
      });
    });

    test('TraitDataVariable', () => {
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
                        value: 'default',
                      },
                      'attributes-data-variable': {
                        value: {
                          path: 'test-input.id1.value',
                          type: 'data-variable',
                          defaultValue: 'default',
                        },
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
      };

      editor.loadProjectData(componentProjectData);

      const components = editor.getComponents();
      const component = components.models[0];
      const value = component.getAttributes();
      expect(value).toEqual({
        value: 'test-value',
      });
    });
  });
});
