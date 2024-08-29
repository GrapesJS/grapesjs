import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { DataSourceProps } from '../../../../src/data_sources/types';

describe('ComponentDataVariable', () => {
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

  test('component initializes with data-variable content', () => {
    const dataSource: DataSourceProps = {
      id: 'ds1',
      records: [{ id: 'id1', name: 'Name1' }],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      type: 'default',
      components: [
        {
          type: DataVariableType,
          value: 'default',
          path: 'ds1.id1.name',
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('Name1');
  });

  test('component updates on data-variable change', () => {
    const dataSource: DataSourceProps = {
      id: 'ds2',
      records: [{ id: 'id1', name: 'Name1' }],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      type: 'default',
      components: [
        {
          type: DataVariableType,
          value: 'default',
          path: 'ds2.id1.name',
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('Name1');

    const ds = dsm.get('ds2');
    ds.getRecord('id1')?.set({ name: 'Name1-UP' });

    expect(cmp.getEl()?.innerHTML).toContain('Name1-UP');
  });

  test("component uses default value if data source doesn't exist", () => {
    const cmp = cmpRoot.append({
      tagName: 'div',
      type: 'default',
      components: [
        {
          type: DataVariableType,
          value: 'default',
          path: 'unknown.id1.name',
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('default');
  });

  test('component updates on data source reset', () => {
    const dataSource: DataSourceProps = {
      id: 'ds3',
      records: [{ id: 'id1', name: 'Name1' }],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      type: 'default',
      components: [
        {
          type: DataVariableType,
          value: 'default',
          path: 'ds3.id1.name',
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('Name1');

    dsm.all.reset();
    expect(cmp.getEl()?.innerHTML).toContain('default');
  });

  test('component updates on data source setRecords', () => {
    const dataSource: DataSourceProps = {
      id: 'component-setRecords',
      records: [{ id: 'id1', name: 'init name' }],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      type: 'default',
      components: [
        {
          type: DataVariableType,
          value: 'default',
          path: `${dataSource.id}.id1.name`,
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('init name');

    const ds = dsm.get(dataSource.id);
    ds.setRecords([{ id: 'id1', name: 'updated name' }]);

    expect(cmp.getEl()?.innerHTML).toContain('updated name');
  });

  test('component updates on record removal', () => {
    const dataSource: DataSourceProps = {
      id: 'ds4',
      records: [{ id: 'id1', name: 'Name1' }],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      type: 'default',
      components: [
        {
          type: DataVariableType,
          value: 'default',
          path: 'ds4.id1.name',
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('Name1');

    const ds = dsm.get('ds4');
    ds.removeRecord('id1');

    expect(cmp.getEl()?.innerHTML).toContain('default');
  });

  test('component initializes and updates with data-variable for nested object', () => {
    const dataSource: DataSourceProps = {
      id: 'dsNestedObject',
      records: [
        {
          id: 'id1',
          nestedObject: {
            name: 'NestedName1',
          },
        },
      ],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      type: 'default',
      components: [
        {
          type: DataVariableType,
          value: 'default',
          path: 'dsNestedObject.id1.nestedObject.name',
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('NestedName1');

    const ds = dsm.get('dsNestedObject');
    ds.getRecord('id1')?.set({ nestedObject: { name: 'NestedName1-UP' } });

    expect(cmp.getEl()?.innerHTML).toContain('NestedName1-UP');
  });

  test('component initializes and updates with data-variable for nested object inside an array', () => {
    const dataSource: DataSourceProps = {
      id: 'dsNestedArray',
      records: [
        {
          id: 'id1',
          items: [
            {
              id: 'item1',
              nestedObject: {
                name: 'NestedItemName1',
              },
            },
          ],
        },
      ],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      type: 'default',
      components: [
        {
          type: DataVariableType,
          value: 'default',
          path: 'dsNestedArray.id1.items.0.nestedObject.name',
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('NestedItemName1');

    const ds = dsm.get('dsNestedArray');
    ds.getRecord('id1')?.set({
      items: [
        {
          id: 'item1',
          nestedObject: { name: 'NestedItemName1-UP' },
        },
      ],
    });

    expect(cmp.getEl()?.innerHTML).toContain('NestedItemName1-UP');
  });
});
