import Editor from '../../../src/editor';
import DataSourceManager from '../../../src/data_sources';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import EditorModel from '../../../src/editor/model/Editor';
import { DataSourceProps } from '../../../src/data_sources/types';
import { filterObjectForSnapshot, setupTestEditor } from '../../common';
import { ProjectData } from '../../../src/storage_manager';

describe('DataSource Storage', () => {
  let editor: Editor;
  let em: EditorModel;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;
  const storedDataSource: DataSourceProps = {
    id: 'component-storage',
    records: [{ id: 'id1', content: 'Hello World' }],
  };

  const nonStoredDataSource: DataSourceProps = {
    id: 'component-non-storage',
    records: [{ id: 'id1', content: 'Hello World' }],
    skipFromStorage: true,
  };

  beforeEach(() => {
    ({ editor, em, dsm, cmpRoot } = setupTestEditor());

    dsm.add(storedDataSource);
    dsm.add(nonStoredDataSource);
  });

  afterEach(() => {
    em.destroy();
  });

  describe('.getProjectData', () => {
    test('ComponentDataVariable', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${storedDataSource.id}.id1.content`,
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

      const dataSources = projectData.dataSources;
      expect(dataSources).toEqual([
        {
          id: storedDataSource.id,
          records: storedDataSource.records,
        },
      ]);
    });
  });

  describe('.loadProjectData', () => {
    test('ComponentDataVariable', () => {
      const componentProjectData: ProjectData = {
        assets: [],
        dataSources: [
          {
            id: storedDataSource.id,
            records: storedDataSource.records,
          },
        ],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      components: [
                        {
                          defaultValue: 'default',
                          path: `${storedDataSource.id}.id1.content`,
                          type: 'data-variable',
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
                id: 'frame-id',
              },
            ],
            id: 'page-id',
            type: 'main',
          },
        ],
        styles: [],
        symbols: [],
      };

      editor.loadProjectData(componentProjectData);

      const dataSource = dsm.get(storedDataSource.id);
      const record = dataSource?.getRecord('id1');
      expect(record?.get('content')).toBe('Hello World');

      expect(editor.getHtml()).toEqual('<body><h1><div>Hello World</div></h1></body>');

      record?.set('content', 'Hello World Updated');

      expect(editor.getHtml()).toEqual('<body><h1><div>Hello World Updated</div></h1></body>');

      const reloadedProjectData = editor.getProjectData();
      const snapshot = filterObjectForSnapshot(reloadedProjectData);
      expect(snapshot).toMatchSnapshot(``);
    });
  });
});
