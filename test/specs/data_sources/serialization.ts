import Editor from '../../../src/editor';
import DataSourceManager from '../../../src/data_sources';
import { DataSourceProps } from '../../../src/data_sources/types';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import EditorModel from '../../../src/editor/model/Editor';

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
  const datasource: DataSourceProps = {
    id: 'component-serialization',
    records: [
      { id: 'id1', content: 'Hello World' },
      { id: 'id2', color: 'red' },
    ],
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
    dsm.add(datasource);
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
          value: 'default',
          path: `${datasource.id}.id1.content`,
        },
      ],
    })[0];

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('Hello World');

    const html = em.getHtml();
    expect(html).toMatchInlineSnapshot('"<body><h1><div>Hello World</div></h1></body>"');
  });

  // DataSources TODO
  test.todo('component .getCss');

  // DataSources TODO
  test.todo('component .getJs');

  describe('.getProjectData', () => {
    test('ComponentDataVariable', () => {
      const dataVariable = {
        type: DataVariableType,
        value: 'default',
        path: `${datasource.id}.id1.content`,
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
      const styleDataSource: DataSourceProps = {
        id: 'colors-data',
        records: [{ id: 'id1', color: 'red' }],
      };
      dsm.add(styleDataSource);

      const dataVariable = {
        type: DataVariableType,
        value: 'black',
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
      const record = { id: 'id1', value: 'test-value' };
      const inputDataSource: DataSourceProps = {
        id: 'test-input',
        records: [record],
      };
      dsm.add(inputDataSource);

      const dataVariable = {
        type: DataVariableType,
        value: 'default',
        path: `${inputDataSource.id}.id1.value`,
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
        value: record.value,
      });

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });
  });
});
