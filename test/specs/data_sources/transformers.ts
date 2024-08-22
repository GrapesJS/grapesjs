import Editor from '../../../src/editor/model/Editor';
import DataSourceManager from '../../../src/data_sources';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import { DataSourceProps } from '../../../src/data_sources/model/DataSource';

describe('DataSource Transformers', () => {
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

  test('onRecordAdd', () => {
    const testDataSource: DataSourceProps = {
      id: 'test-data-source',
      records: [],
      transformers: {
        onRecordAdd: ({ record }) => {
          record.content = record.content.toUpperCase();
          return record;
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
          value: 'default',
          path: 'test-data-source.id1.content',
        },
      ],
    })[0];

    const ds = dsm.get('test-data-source');
    ds.addRecord({ id: 'id1', content: 'i love grapes' });

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('I LOVE GRAPES');

    const result = ds.getRecord('id1')?.get('content');
    expect(result).toBe('I LOVE GRAPES');
  });

  test('onRecordSet', () => {
    const testDataSource: DataSourceProps = {
      id: 'test-data-source',
      records: [],
      transformers: {
        onRecordSet: ({ id, key, value }) => {
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
          value: 'default',
          path: 'test-data-source.id1.content',
        },
      ],
    })[0];

    const ds = dsm.get('test-data-source');
    const dr = ds.addRecord({ id: 'id1', content: 'i love grapes' });

    expect(() => dr.set('content', 123)).toThrowError('Value must be a string');

    dr.set('content', 'I LOVE GRAPES');

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('I LOVE GRAPES');

    const result = ds.getRecord('id1')?.get('content');
    expect(result).toBe('I LOVE GRAPES');
  });

  test('onRecordRead', () => {
    const testDataSource: DataSourceProps = {
      id: 'test-data-source',
      records: [],
      transformers: {
        onRecordRead: ({ record }) => {
          const content = record.get('content');

          return record.set('content', content.toUpperCase(), { avoidTransformers: true });
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
          value: 'default',
          path: 'test-data-source.id1.content',
        },
      ],
    })[0];

    const ds = dsm.get('test-data-source');
    ds.addRecord({ id: 'id1', content: 'i love grapes' });

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('I LOVE GRAPES');

    const result = ds.getRecord('id1')?.get('content');
    expect(result).toBe('I LOVE GRAPES');
  });

  test('onRecordDelete', () => {
    const testDataSource: DataSourceProps = {
      id: 'test-data-source',
      records: [],
      transformers: {
        onRecordDelete: ({ record }) => {
          if (record.get('content') === 'i love grapes') {
            throw new Error('Cannot delete record with content "i love grapes"');
          }
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
          value: 'default',
          path: 'test-data-source.id1.content',
        },
      ],
    })[0];

    const ds = dsm.get('test-data-source');
    ds.addRecord({ id: 'id1', content: 'i love grapes' });

    let el = cmp.getEl();
    expect(el?.innerHTML).toContain('i love grapes');

    expect(() => ds.removeRecord('id1')).toThrowError('Cannot delete record with content "i love grapes"');
  });
});
