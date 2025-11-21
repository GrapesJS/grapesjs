import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { setupTestEditor } from '../../../common';
import { Component } from '../../../../src';

const staticAttributeValue = 'some tiltle';
describe('Dynamic Attributes', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;
  const staticAttributes = {
    staticAttribute: staticAttributeValue,
  };

  beforeEach(() => {
    ({ em, dsm, cmpRoot } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  test('static and dynamic attributes', () => {
    const inputDataSource = {
      id: 'ds_id',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(inputDataSource);

    const attributes = {
      ...staticAttributes,
      dynamicAttribute: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id1.value',
      },
    };
    const cmp = cmpRoot.append({
      tagName: 'input',
      attributes,
    })[0];

    testAttribute(cmp, 'dynamicAttribute', 'test-value');
    testStaticAttributes(cmp);
  });

  test('dynamic attributes should listen to change', () => {
    const dataSource = {
      id: 'ds_id',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(dataSource);

    const attributes = {
      ...staticAttributes,
      dynamicAttribute: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id1.value',
      },
    };
    const cmp = cmpRoot.append({
      tagName: 'input',
      attributes,
    })[0];

    testAttribute(cmp, 'dynamicAttribute', 'test-value');
    testStaticAttributes(cmp);

    changeDataSourceValue(dsm, 'id1');
    testAttribute(cmp, 'dynamicAttribute', 'changed-value');
  });

  test('(Component.setAttributes) dynamic attributes should listen to the latest dynamic value', () => {
    const dataSource = {
      id: 'ds_id',
      records: [
        { id: 'id1', value: 'test-value' },
        { id: 'id2', value: 'second-test-value' },
      ],
    };
    dsm.add(dataSource);

    const attributes = {
      ...staticAttributes,
      dynamicAttribute: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id1.value',
      },
    };
    const cmp = cmpRoot.append({
      tagName: 'input',
      attributes,
    })[0];

    cmp.setAttributes({ dynamicAttribute: 'some-static-value' });
    testAttribute(cmp, 'dynamicAttribute', 'some-static-value');

    cmp.setAttributes({
      dynamicAttribute: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id2.value',
      },
    });
    changeDataSourceValue(dsm, 'id1');
    testAttribute(cmp, 'dynamicAttribute', 'second-test-value');

    changeDataSourceValue(dsm, 'id2');
    testAttribute(cmp, 'dynamicAttribute', 'changed-value');
  });

  test('(Component.addAttributes) dynamic attributes should listen to the latest dynamic value', () => {
    const dataSource = {
      id: 'ds_id',
      records: [
        { id: 'id1', value: 'test-value' },
        { id: 'id2', value: 'second-test-value' },
      ],
    };
    dsm.add(dataSource);

    const attributes = {
      ...staticAttributes,
      dynamicAttribute: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id1.value',
      },
    };
    const cmp = cmpRoot.append({
      tagName: 'input',
      attributes,
    })[0];

    cmp.addAttributes({ dynamicAttribute: 'some-static-value' });
    testAttribute(cmp, 'dynamicAttribute', 'some-static-value');

    cmp.addAttributes({
      dynamicAttribute: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id2.value',
      },
    });
    changeDataSourceValue(dsm, 'id1');
    testAttribute(cmp, 'dynamicAttribute', 'second-test-value');

    changeDataSourceValue(dsm, 'id2');
    testAttribute(cmp, 'dynamicAttribute', 'changed-value');
  });

  test('dynamic attributes should stop listening to change if the value changed to static', () => {
    const dataSource = {
      id: 'ds_id',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(dataSource);

    const attributes = {
      ...staticAttributes,
      dynamicAttribute: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id1.value',
      },
    };
    const cmp = cmpRoot.append({
      tagName: 'input',
      attributes,
    })[0];

    testAttribute(cmp, 'dynamicAttribute', 'test-value');
    testStaticAttributes(cmp);

    cmp.setAttributes({
      dynamicAttribute: 'static-value',
    });
    changeDataSourceValue(dsm, 'id1');
    testAttribute(cmp, 'dynamicAttribute', 'static-value');
  });

  test('dynamic attributes should start listening to change if the value changed to dynamic value', () => {
    const dataSource = {
      id: 'ds_id',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(dataSource);

    const attributes = {
      ...staticAttributes,
      dynamicAttribute: 'static-value',
    };
    const cmp = cmpRoot.append({
      tagName: 'input',
      attributes,
    })[0];

    cmp.setAttributes({
      dynamicAttribute: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id1.value',
      },
    });
    testAttribute(cmp, 'dynamicAttribute', 'test-value');
    changeDataSourceValue(dsm, 'id1');
    testAttribute(cmp, 'dynamicAttribute', 'changed-value');
  });

  test('dynamic attributes should stop listening to change if the attribute was removed', () => {
    const dataSource = {
      id: 'ds_id',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(dataSource);

    const attributes = {
      ...staticAttributes,
      dynamicAttribute: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id1.value',
      },
    };
    const cmp = cmpRoot.append({
      tagName: 'input',
      attributes,
    })[0];

    testAttribute(cmp, 'dynamicAttribute', 'test-value');
    testStaticAttributes(cmp);

    cmp.removeAttributes('dynamicAttribute');
    changeDataSourceValue(dsm, 'id1');
    expect(cmp?.getAttributes()['dynamicAttribute']).toBe(undefined);
    const input = cmp.getEl();
    expect(input?.getAttribute('dynamicAttribute')).toBe(null);
  });

  test('attributes should not collide with styles', () => {
    ({ em, dsm, cmpRoot } = setupTestEditor({ config: { avoidInlineStyle: false } }));
    dsm.add({
      id: 'ds_id',
      records: [
        { id: 'id1', value: 'test-value' },
        { id: 'id2', value: 'second-test-value' },
      ],
    });

    const cmp = cmpRoot.append({
      tagName: 'input',
    })[0];

    cmp.addAttributes({
      static: 'static-value-attr',
      dynamic: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id1.value',
      },
    });
    cmp.addStyle({
      static: 'static-value-style',
      dynamic: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id2.value',
      },
    });

    testAttribute(cmp, 'style', 'static:static-value-style;dynamic:second-test-value;');
    testAttribute(cmp, 'dynamic', 'test-value');
    testAttribute(cmp, 'static', 'static-value-attr');

    cmp.addAttributes({
      static: 'static-value-attr-2',
      dynamic: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id2.value',
      },
    });
    cmp.addStyle({
      static: 'static-value-style-2',
      dynamic: {
        type: DataVariableType,
        defaultValue: 'default',
        path: 'ds_id.id1.value',
      },
    });

    testAttribute(cmp, 'style', 'static:static-value-style-2;dynamic:test-value;');
    testAttribute(cmp, 'dynamic', 'second-test-value');
    testAttribute(cmp, 'static', 'static-value-attr-2');
  });
});

function changeDataSourceValue(dsm: DataSourceManager, id: string) {
  dsm.get('ds_id').getRecord(id)?.set('value', 'intermediate-value1');
  dsm.get('ds_id').getRecord(id)?.set('value', 'intermediate-value2');
  dsm.get('ds_id').getRecord(id)?.set('value', 'changed-value');
}

function testStaticAttributes(cmp: Component) {
  testAttribute(cmp, 'staticAttribute', staticAttributeValue);
}

function testAttribute(cmp: Component, attribute: string, value: string) {
  expect(cmp?.getAttributes()[attribute]).toBe(value);
  const input = cmp.getEl();
  expect(input?.getAttribute(attribute)).toBe(value);
}
