import DataSourceManager from '../../../../src/data_sources';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { setupTestEditor } from '../../../common';
import EditorModel from '../../../../src/editor/model/Editor';
import ComponentDataVariable from '../../../../src/data_sources/model/ComponentDataVariable';

describe('ComponentDataVariable', () => {
  let em: EditorModel;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    ({ em, dsm, cmpRoot } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  test('component initializes with data-variable content', () => {
    const dataSource = {
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
          dataResolver: { defaultValue: 'default', path: 'ds1.id1.name' },
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('Name1');
    expect(cmp.getInnerHTML()).toContain('Name1');
  });

  test('component updates on data-variable change', () => {
    const dataSource = {
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
          dataResolver: { defaultValue: 'default', path: 'ds2.id1.name' },
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('Name1');
    expect(cmp.getInnerHTML()).toContain('Name1');

    const ds = dsm.get('ds2');
    ds.getRecord('id1')?.set({ name: 'Name1-UP' });

    expect(cmp.getEl()?.innerHTML).toContain('Name1-UP');
    expect(cmp.getInnerHTML()).toContain('Name1-UP');
  });

  test("component uses default value if data source doesn't exist", () => {
    const cmp = cmpRoot.append({
      tagName: 'div',
      type: 'default',
      components: [
        {
          type: DataVariableType,
          dataResolver: { defaultValue: 'default', path: 'unknown.id1.name' },
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('default');
  });

  test('component updates on data source reset', () => {
    const dataSource = {
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
          dataResolver: { defaultValue: 'default', path: 'ds3.id1.name' },
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('Name1');
    expect(cmp.getInnerHTML()).toContain('Name1');

    dsm.all.reset();
    expect(cmp.getEl()?.innerHTML).toContain('default');
    expect(cmp.getInnerHTML()).toContain('default');
  });

  test('component updates on data source setRecords', () => {
    const dataSource = {
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
          dataResolver: { defaultValue: 'default', path: `${dataSource.id}.id1.name` },
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('init name');
    expect(cmp.getInnerHTML()).toContain('init name');

    const ds = dsm.get(dataSource.id);
    ds.setRecords([{ id: 'id1', name: 'updated name' }]);

    expect(cmp.getEl()?.innerHTML).toContain('updated name');
    expect(cmp.getInnerHTML()).toContain('updated name');
  });

  test('component updates on record removal', () => {
    const dataSource = {
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
          dataResolver: { defaultValue: 'default', path: 'ds4.id1.name' },
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('Name1');
    expect(cmp.getInnerHTML()).toContain('Name1');

    const ds = dsm.get('ds4');
    ds.removeRecord('id1');

    expect(cmp.getEl()?.innerHTML).toContain('default');
    expect(cmp.getInnerHTML()).toContain('default');
  });

  test('component initializes and updates with data-variable for nested object', () => {
    const dataSource = {
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
          dataResolver: { defaultValue: 'default', path: 'dsNestedObject.id1.nestedObject.name' },
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('NestedName1');
    expect(cmp.getInnerHTML()).toContain('NestedName1');

    const ds = dsm.get('dsNestedObject');
    ds.getRecord('id1')?.set({ nestedObject: { name: 'NestedName1-UP' } });

    expect(cmp.getEl()?.innerHTML).toContain('NestedName1-UP');
    expect(cmp.getInnerHTML()).toContain('NestedName1-UP');
  });

  test('component initializes and updates with data-variable for nested object inside an array', () => {
    const dataSource = {
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
          dataResolver: { defaultValue: 'default', path: 'dsNestedArray.id1.items.0.nestedObject.name' },
        },
      ],
    })[0];

    expect(cmp.getEl()?.innerHTML).toContain('NestedItemName1');
    expect(cmp.getInnerHTML()).toContain('NestedItemName1');

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
    expect(cmp.getInnerHTML()).toContain('NestedItemName1-UP');
  });

  test('component initalizes and updates data on datarecord set object', () => {
    const dataSource = {
      id: 'setObject',
      records: [{ id: 'id1', content: 'Hello World', color: 'red' }],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      components: [
        {
          type: DataVariableType,
          dataResolver: { defaultValue: 'default', path: `${dataSource.id}.id1.content` },
        },
      ],
      style: {
        color: {
          type: DataVariableType,
          defaultValue: 'black',
          path: `${dataSource.id}.id1.color`,
        },
      },
    })[0];

    const style = cmp.getStyle();
    expect(style).toHaveProperty('color', 'red');
    expect(cmp.getEl()?.innerHTML).toContain('Hello World');

    const ds = dsm.get('setObject');
    ds.getRecord('id1')?.set({ content: 'Hello World UP', color: 'blue' });

    const updatedStyle = cmp.getStyle();
    expect(updatedStyle).toHaveProperty('color', 'blue');
    expect(cmp.getEl()?.innerHTML).toContain('Hello World UP');
  });

  test("fixes: ComponentDataVariable dataResolver type 'data-variable' issue", () => {
    const dataSource = {
      id: 'ds1',
      records: [{ id: 'id1', name: 'Name1' }],
    };
    dsm.add(dataSource);

    const dataResolver = { type: DataVariableType, defaultValue: 'default', path: 'ds1.id1.name' };
    const cmp = cmpRoot.append({
      type: DataVariableType,
      dataResolver,
    })[0] as ComponentDataVariable;

    expect(cmp.getDataResolver()).toBe(dataResolver);
    expect(cmp.getEl()?.innerHTML).toContain('Name1');
    expect(cmp.getInnerHTML()).toContain('Name1');
  });

  test('renders content as plain text or HTML based on asPlainText option', () => {
    const htmlContent = '<p>Hello <strong>World</strong>!</p>';
    const plainTextContent = '&lt;p&gt;Hello &lt;strong&gt;World&lt;/strong&gt;!&lt;/p&gt;';
    const dataSource = {
      id: 'dsHtmlTest',
      records: [{ id: 'r1', content: htmlContent }],
    };
    dsm.add(dataSource);

    // Scenario 1: asPlainText is true
    const cmpPlainText = cmpRoot.append({
      type: DataVariableType,
      dataResolver: { path: 'dsHtmlTest.r1.content', asPlainText: true },
    })[0] as ComponentDataVariable;
    expect(cmpPlainText.getEl()?.innerHTML).toBe(plainTextContent);
    expect(cmpPlainText.getEl()?.textContent).toBe(htmlContent);

    // Scenario 2: asPlainText is false
    const cmpHtml = cmpRoot.append({
      type: DataVariableType,
      dataResolver: { path: 'dsHtmlTest.r1.content', asPlainText: false },
    })[0] as ComponentDataVariable;
    expect(cmpHtml.getEl()?.innerHTML).toBe(htmlContent);
    expect(cmpHtml.getEl()?.textContent).toBe('Hello World!');

    // Scenario 3: asPlainText is omitted (should default to HTML rendering)
    const cmpDefaultHtml = cmpRoot.append({
      type: DataVariableType,
      dataResolver: { path: 'dsHtmlTest.r1.content' },
    })[0] as ComponentDataVariable;
    expect(cmpDefaultHtml.getEl()?.innerHTML).toBe(htmlContent);
    expect(cmpDefaultHtml.getEl()?.textContent).toBe('Hello World!');
  });
});
