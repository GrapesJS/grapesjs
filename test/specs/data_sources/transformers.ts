import DataSourceManager from '../../../src/data_sources';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import { DataSourceProps } from '../../../src/data_sources/types';
import { setupTestEditor } from '../../common';
import EditorModel from '../../../src/editor/model/Editor';

describe('DataSource Transformers', () => {
  let em: EditorModel;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    ({ em, dsm, cmpRoot } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  test('should assert that onRecordSetValue is called when adding a record', () => {
    const testDataSource: DataSourceProps = {
      id: 'test-data-source',
      records: [],
      transformers: {
        onRecordSetValue: ({ key, value }) => {
          if (key !== 'content') {
            return value;
          }

          return (value as string).toUpperCase();
        },
      },
    };
    dsm.add(testDataSource);

    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      components: [
        {
          type: DataVariableType,
          defaultValue: 'default',
          path: 'test-data-source.id1.content',
        },
      ],
    })[0];

    const ds = dsm.get('test-data-source');
    ds.addRecord({ id: 'id1', content: 'i love grapes' });

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('I LOVE GRAPES');
    expect(cmp.getInnerHTML()).toContain('I LOVE GRAPES');

    const result = ds.getRecord('id1')?.get('content');
    expect(result).toBe('I LOVE GRAPES');
  });

  test('should assert that onRecordSetValue is called when setting a value on a record', () => {
    const testDataSource: DataSourceProps = {
      id: 'test-data-source',
      records: [],
      transformers: {
        onRecordSetValue: ({ id, key, value }) => {
          if (key !== 'content') {
            return value;
          }

          if (typeof value !== 'string') {
            throw new Error('Value must be a string');
          }

          return value.toUpperCase();
        },
      },
    };
    dsm.add(testDataSource);

    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      components: [
        {
          type: DataVariableType,
          defaultValue: 'default',
          path: 'test-data-source.id1.content',
        },
      ],
    })[0];

    const ds = dsm.get('test-data-source');
    const dr = ds.addRecord({ id: 'id1', content: 'i love grapes' });

    expect(() => dr.set('content', 123)).toThrowError('Value must be a string');
    expect(() => dr.set({ content: 123 })).toThrowError('Value must be a string');

    dr.set({ content: 'I LOVE GRAPES' });

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('I LOVE GRAPES');
    expect(cmp.getInnerHTML()).toContain('I LOVE GRAPES');

    const result = ds.getRecord('id1')?.get('content');
    expect(result).toBe('I LOVE GRAPES');
  });
});
