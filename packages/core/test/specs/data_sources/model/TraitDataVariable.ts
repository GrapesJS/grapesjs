import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { DataSourceProps } from '../../../../src/data_sources/types';
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
              defaultValue: 'default',
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
      })[0];

      const input = cmp.getEl();
      expect(input?.getAttribute('value')).toBe('test-value');
      expect(cmp?.getAttributes().value).toBe('test-value');
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
              defaultValue: 'default',
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
      })[0];

      const input = cmp.getEl();
      expect(input?.getAttribute('placeholder')).toBe('test-value');
      expect(cmp?.getAttributes().placeholder).toBe('test-value');

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'new-value' });

      expect(input?.getAttribute('placeholder')).toBe('new-value');
      expect(cmp?.getAttributes().placeholder).toBe('new-value');
    });

    test('component updates to defaultValue on record removal', () => {
      const inputDataSource: DataSourceProps = {
        id: 'test-input-removal',
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
      testDs.removeRecord('id1');

      expect(input?.getAttribute('value')).toBe('default');
      expect(cmp?.getAttributes().value).toBe('default');
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

    test('component initializes data-variable value for nested object', () => {
      const inputDataSource: DataSourceProps = {
        id: 'nested-input-data',
        records: [
          {
            id: 'id1',
            nestedObject: {
              value: 'nested-value',
            },
          },
        ],
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
              path: 'nested-input-data.id1.nestedObject.value',
            },
          },
        ],
      })[0];

      const input = cmp.getEl();
      expect(input?.getAttribute('value')).toBe('nested-value');
      expect(cmp?.getAttributes().value).toBe('nested-value');
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
        tagName: 'input',
        attributes: { type: 'checkbox', name: 'my-checkbox' },
        traits: [
          {
            type: 'checkbox',
            label: 'Checked',
            name: 'checked',
            value: {
              type: 'data-variable',
              defaultValue: 'false',
              path: `${inputDataSource.id}.id1.value`,
            },
            valueTrue: 'true',
            valueFalse: 'false',
          },
        ],
      })[0];

      const input = cmp.getEl() as HTMLInputElement;
      expect(input?.checked).toBe(true);
      expect(input?.getAttribute('checked')).toBe('true');

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'false' });

      expect(input?.getAttribute('checked')).toBe('false');
      // Not syncing - related to
      // https://github.com/GrapesJS/grapesjs/discussions/5868
      // https://github.com/GrapesJS/grapesjs/discussions/4415
      // https://github.com/GrapesJS/grapesjs/pull/6095
      // expect(input?.checked).toBe(false);
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
              defaultValue: 'default',
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
      })[0];

      const img = cmp.getEl() as HTMLImageElement;
      expect(img?.getAttribute('src')).toBe('url-to-cat-image');
      expect(cmp?.getAttributes().src).toBe('url-to-cat-image');

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'url-to-dog-image' });

      expect(img?.getAttribute('src')).toBe('url-to-dog-image');
      expect(cmp?.getAttributes().src).toBe('url-to-dog-image');
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
              defaultValue: 'default',
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
        components: [{ tagName: 'span', content: 'Link' }],
      })[0];

      const link = cmp.getEl() as HTMLLinkElement;
      expect(link?.href).toBe('http://localhost/url-to-cat-image');
      expect(cmp?.getAttributes().href).toBe('url-to-cat-image');

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'url-to-dog-image' });

      expect(link?.href).toBe('http://localhost/url-to-dog-image');
      expect(cmp?.getAttributes().href).toBe('url-to-dog-image');
    });
  });

  describe('changeProp', () => {
    test('component initializes and updates data-variable value using changeProp', () => {
      const inputDataSource: DataSourceProps = {
        id: 'test-change-prop-datasource',
        records: [{ id: 'id1', value: 'I love grapes' }],
      };
      dsm.add(inputDataSource);

      const cmp = cmpRoot.append({
        tagName: 'div',
        type: 'default',
        traits: [
          {
            name: 'test-change-prop',
            type: 'text',
            changeProp: true,
            value: {
              type: DataVariableType,
              defaultValue: 'default',
              path: `${inputDataSource.id}.id1.value`,
            },
          },
        ],
      })[0];

      let property = cmp.get('test-change-prop');
      expect(property).toBe('I love grapes');

      const testDs = dsm.get(inputDataSource.id);
      testDs.getRecord('id1')?.set({ value: 'I really love grapes' });

      property = cmp.get('test-change-prop');
      expect(property).toBe('I really love grapes');
    });

    test('should cover when changeProp trait value is not set', () => {
      const cmp = cmpRoot.append({
        tagName: 'div',
        type: 'default',
        'test-change-prop': 'initial-value',
        traits: [
          {
            name: 'test-change-prop',
            type: 'text',
            changeProp: true,
          },
        ],
      })[0];

      let property = cmp.get('test-change-prop');
      expect(property).toBe('initial-value');
    });
  });
});
