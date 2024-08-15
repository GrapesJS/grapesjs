import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import { DataSourceProps } from '../../../../src/data_sources/types';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';

describe('TraitDataVariable', () => {
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

  describe('text input component', () => {
    test('component initializes with trait data-variable value on text input component', () => {
      const inputDataSource: DataSourceProps = {
        id: 'test-input',
        records: [{ id: 'id1', value: 'test-value' }],
      };
      dsm.add(inputDataSource);

      const cmp = cmpRoot.append({
        tagName: 'input',
        traits: [
          'name',
          'type',
          {
            type: 'text',
            label: 'Value',
            name: 'value',
            value: {
              type: DataVariableType,
              value: 'default',
              path: 'test-input.id1.value',
            },
          },
        ],
      })[0];

      const input = cmp.getEl();
      expect(input?.getAttribute('value')).toBe('test-value');
    });

    test('component updates with trait data-variable value on text input component', () => {
      const inputDataSource: DataSourceProps = {
        id: 'test-input',
        records: [{ id: 'id1', value: 'test-value' }],
      };
      dsm.add(inputDataSource);

      const cmp = cmpRoot.append({
        tagName: 'input',
        traits: [
          'name',
          'type',
          {
            type: 'text',
            label: 'Value',
            name: 'value',
            value: {
              type: DataVariableType,
              value: 'default',
              path: 'test-input.id1.value',
            },
          },
        ],
      })[0];

      const input = cmp.getEl();
      expect(input?.getAttribute('value')).toBe('test-value');

      const testDs = dsm.get('test-input');
      testDs.getRecord('id1')?.set({ value: 'new-value' });

      expect(input?.getAttribute('value')).toBe('new-value');
    });
  });
});