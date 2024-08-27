import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { DataSourceProps } from '../../../../src/data_sources/types';

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
    test('component initializes data-variable value', () => {
      const inputDataSource: DataSourceProps = {
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
              value: 'default',
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
      })[0];

      const input = cmp.getEl();
      expect(input?.getAttribute('value')).toBe('test-value');
    });

    test('component initializes data-variable placeholder', () => {
      const inputDataSource: DataSourceProps = {
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
            label: 'Placeholder',
            name: 'placeholder',
            value: {
              type: DataVariableType,
              value: 'default',
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
      })[0];

      const input = cmp.getEl();
      expect(input?.getAttribute('placeholder')).toBe('test-value');

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'new-value' });
      expect(input?.getAttribute('placeholder')).toBe('new-value');
    });

    test('component updates with data-variable value', () => {
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
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
      })[0];

      const input = cmp.getEl();
      expect(input?.getAttribute('value')).toBe('test-value');

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'new-value' });
      expect(input?.getAttribute('value')).toBe('new-value');
    });
  });

  describe('checkbox input component', () => {
    test('component initializes and updates data-variable value', () => {
      const inputDataSource: DataSourceProps = {
        id: 'test-checkbox-datasource',
        records: [{ id: 'id1', value: 'true' }],
      };
      dsm.add(inputDataSource);

      const cmp = cmpRoot.append({
        type: 'checkbox',
        tagName: 'input',
        attributes: { type: 'checkbox', name: 'my-checkbox' },
        traits: [
          {
            type: 'checkbox',
            label: 'Checked',
            name: 'checked',
            value: {
              type: 'data-variable',
              value: 'false',
              path: `${inputDataSource.id}.id1.value`,
            },
            valueTrue: 'true',
            valueFalse: 'false',
          },
        ],
      })[0];

      const input = cmp.getEl() as HTMLInputElement;
      expect(input?.checked).toBe(true);

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'false' });
      expect(input?.getAttribute('checked')).toBe('false');
    });
  });

  describe('image component', () => {
    test('component initializes and updates data-variable value', () => {
      const inputDataSource: DataSourceProps = {
        id: 'test-image-datasource',
        records: [{ id: 'id1', value: 'url-to-cat-image' }],
      };
      dsm.add(inputDataSource);

      const cmp = cmpRoot.append({
        type: 'image',
        tagName: 'img',
        traits: [
          {
            type: 'text',
            name: 'src',
            value: {
              type: 'data-variable',
              value: 'default',
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
      })[0];

      const img = cmp.getEl() as HTMLImageElement;
      expect(img?.getAttribute('src')).toBe('url-to-cat-image');

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'url-to-dog-image' });
      expect(img?.getAttribute('src')).toBe('url-to-dog-image');
    });
  });

  describe('link component', () => {
    test('component initializes and updates data-variable value', () => {
      const inputDataSource: DataSourceProps = {
        id: 'test-link-datasource',
        records: [{ id: 'id1', value: 'url-to-cat-image' }],
      };
      dsm.add(inputDataSource);

      const cmp = cmpRoot.append({
        type: 'link',
        tagName: 'a',
        traits: [
          {
            type: 'text',
            name: 'href',
            value: {
              type: 'data-variable',
              value: 'default',
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
        components: [{ tagName: 'span', content: 'Link' }],
      })[0];

      const link = cmp.getEl() as HTMLLinkElement;
      expect(link?.href).toBe('http://localhost/url-to-cat-image');

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'url-to-dog-image' });
      expect(link?.href).toBe('http://localhost/url-to-dog-image');
    });
  });
});
