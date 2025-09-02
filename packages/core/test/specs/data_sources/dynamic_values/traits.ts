import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { setupTestEditor } from '../../../common';

describe('TraitDataVariable', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    ({ em, dsm, cmpRoot } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  test('set component attribute to trait value if component has no value for the attribute', () => {
    const inputDataSource = {
      id: 'test-input',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(inputDataSource);

    const cmp = cmpRoot.append({
      tagName: 'input',
      traits: [
        'name',
        {
          type: 'text',
          label: 'Value',
          name: 'value',
          value: {
            type: DataVariableType,
            defaultValue: 'default',
            path: `${inputDataSource.id}.id1.value`,
          },
        },
      ],
    })[0];

    const input = cmp.getEl();
    expect(input?.getAttribute('value')).toBe('test-value');
    expect(cmp?.getAttributes().value).toBe('test-value');

    const testDs = dsm.get(inputDataSource.id);
    testDs.getRecord('id1')?.set({ value: 'new-value' });

    expect(input?.getAttribute('value')).toBe('new-value');
    expect(cmp?.getAttributes().value).toBe('new-value');
  });

  test('set component prop to trait value if component has no value for the prop', () => {
    const inputDataSource = {
      id: 'test-input',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(inputDataSource);

    const cmp = cmpRoot.append({
      tagName: 'input',
      traits: [
        'name',
        {
          type: 'text',
          label: 'Value',
          name: 'value',
          changeProp: true,
          value: {
            type: DataVariableType,
            defaultValue: 'default',
            path: `${inputDataSource.id}.id1.value`,
          },
        },
      ],
    })[0];

    expect(cmp?.get('value')).toBe('test-value');

    const testDs = dsm.get(inputDataSource.id);
    testDs.getRecord('id1')?.set({ value: 'new-value' });

    expect(cmp?.get('value')).toBe('new-value');
  });

  test('should keep component prop if component already has a value for the prop', () => {
    const inputDataSource = {
      id: 'test-input',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(inputDataSource);

    const cmp = cmpRoot.append({
      tagName: 'input',
      attributes: {
        value: 'existing-value',
      },
      traits: [
        'name',
        {
          type: 'text',
          label: 'Value',
          name: 'value',
          changeProp: true,
          value: {
            type: DataVariableType,
            defaultValue: 'default',
            path: `${inputDataSource.id}.id1.value`,
          },
        },
      ],
    })[0];

    const input = cmp.getEl();
    expect(input?.getAttribute('value')).toBe('existing-value');
    expect(cmp?.getAttributes().value).toBe('existing-value');

    const testDs = dsm.get(inputDataSource.id);
    testDs.getRecord('id1')?.set({ value: 'new-value' });

    expect(input?.getAttribute('value')).toBe('existing-value');
    expect(cmp?.getAttributes().value).toBe('existing-value');
  });

  test('should keep component prop if component already has a value for the prop', () => {
    const inputDataSource = {
      id: 'test-input',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(inputDataSource);

    const cmp = cmpRoot.append({
      tagName: 'input',
      value: 'existing-value',
      traits: [
        'name',
        {
          type: 'text',
          label: 'Value',
          name: 'value',
          changeProp: true,
          value: {
            type: DataVariableType,
            defaultValue: 'default',
            path: `${inputDataSource.id}.id1.value`,
          },
        },
      ],
    })[0];

    expect(cmp?.get('value')).toBe('existing-value');

    const testDs = dsm.get(inputDataSource.id);
    testDs.getRecord('id1')?.set({ value: 'new-value' });

    expect(cmp?.get('value')).toBe('existing-value');
  });
});
