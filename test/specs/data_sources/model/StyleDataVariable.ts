import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { DataSourceProps } from '../../../../src/data_sources/types';

describe('StyleDataVariable', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  let fixtures: HTMLElement;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    em = new Editor({
      mediaCondition: 'max-width',
      avoidInlineStyle: true,
    });
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
  });

  afterEach(() => {
    em.destroy();
  });

  test('component initializes with data-variable style', () => {
    const styleDataSource: DataSourceProps = {
      id: 'colors-data',
      records: [{ id: 'id1', color: 'red' }],
    };
    dsm.add(styleDataSource);

    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      content: 'Hello World',
      style: {
        color: {
          type: DataVariableType,
          defaultValue: 'black',
          path: 'colors-data.id1.color',
        },
      },
    })[0];

    const style = cmp.getStyle();
    expect(style).toHaveProperty('color', 'red');
  });

  test('component updates on style change', () => {
    const styleDataSource: DataSourceProps = {
      id: 'colors-data',
      records: [{ id: 'id1', color: 'red' }],
    };
    dsm.add(styleDataSource);

    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      content: 'Hello World',
      style: {
        color: {
          type: DataVariableType,
          defaultValue: 'black',
          path: 'colors-data.id1.color',
        },
      },
    })[0];

    const style = cmp.getStyle();
    expect(style).toHaveProperty('color', 'red');

    const colorsDatasource = dsm.get('colors-data');
    colorsDatasource.getRecord('id1')?.set({ color: 'blue' });

    const updatedStyle = cmp.getStyle();
    expect(updatedStyle).toHaveProperty('color', 'blue');
  });

  test('component updates to defaultValue on record removal', () => {
    const styleDataSource: DataSourceProps = {
      id: 'colors-data-removal',
      records: [{ id: 'id1', color: 'red' }],
    };
    dsm.add(styleDataSource);

    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      content: 'Hello World',
      style: {
        color: {
          type: DataVariableType,
          defaultValue: 'black',
          path: `${styleDataSource.id}.id1.color`,
        },
      },
    })[0];

    const style = cmp.getStyle();
    expect(style).toHaveProperty('color', 'red');

    const colorsDatasource = dsm.get(styleDataSource.id);
    colorsDatasource.removeRecord('id1');

    const updatedStyle = cmp.getStyle();
    expect(updatedStyle).toHaveProperty('color', 'black');
  });

  test('component updates on style change', () => {
    const styleDataSource: DataSourceProps = {
      id: 'colors-data',
      records: [{ id: 'id1', color: 'red' }],
    };
    dsm.add(styleDataSource);

    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      content: 'Hello World',
      style: {
        color: {
          type: DataVariableType,
          defaultValue: 'black',
          path: 'colors-data.id1.color',
        },
      },
    })[0];

    const style = cmp.getStyle();
    expect(style).toHaveProperty('color', 'red');

    const colorsDatasource = dsm.get('colors-data');
    colorsDatasource.getRecord('id1')?.set({ color: 'blue' });

    const updatedStyle = cmp.getStyle();
    expect(updatedStyle).toHaveProperty('color', 'blue');
  });

  test("should use default value if data source doesn't exist", () => {
    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      content: 'Hello World',
      style: {
        color: {
          type: DataVariableType,
          defaultValue: 'black',
          path: 'unknown.id1.color',
        },
      },
    })[0];

    const style = cmp.getStyle();
    expect(style).toHaveProperty('color', 'black');
  });

  test('component initializes and updates with data-variable style for nested object', () => {
    const styleDataSource: DataSourceProps = {
      id: 'style-data',
      records: [
        {
          id: 'id1',
          nestedObject: {
            color: 'red',
          },
        },
      ],
    };
    dsm.add(styleDataSource);

    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      content: 'Hello World',
      style: {
        color: {
          type: DataVariableType,
          defaultValue: 'black',
          path: 'style-data.id1.nestedObject.color',
        },
      },
    })[0];

    const style = cmp.getStyle();
    expect(style).toHaveProperty('color', 'red');

    const ds = dsm.get('style-data');
    ds.getRecord('id1')?.set({ nestedObject: { color: 'blue' } });

    const updatedStyle = cmp.getStyle();
    expect(updatedStyle).toHaveProperty('color', 'blue');
  });
});
