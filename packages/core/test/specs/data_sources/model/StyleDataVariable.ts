import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { setupTestEditor } from '../../../common';

describe('StyleDataVariable', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    ({ em, dsm, cmpRoot } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  test('component initializes with data-variable style', () => {
    const styleDataSource = {
      id: 'colors-data',
      records: [{ id: 'id1', color: 'red' }],
    };
    dsm.add(styleDataSource);

    const initialStyle = {
      color: {
        type: DataVariableType,
        defaultValue: 'black',
        path: 'colors-data.id1.color',
      },
    };

    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      content: 'Hello World',
      style: initialStyle,
    })[0];

    const style = cmp.getStyle();
    expect(style).toHaveProperty('color', 'red');
  });

  test('component updates on style change', () => {
    const styleDataSource = {
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
    const styleDataSource = {
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
    const styleDataSource = {
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

  describe('Component style manipulations', () => {
    test('adding a new dynamic style with addStyle', () => {
      dsm.add({ id: 'data1', records: [{ id: 'rec1', color: 'red' }] });
      const cmp = cmpRoot.append({
        style: {
          color: { type: DataVariableType, path: 'data1.rec1.color' },
        },
      })[0];
      expect(cmp.getStyle()).toEqual({ color: 'red' });

      dsm.add({ id: 'data2', records: [{ id: 'rec2', width: '100px' }] });
      cmp.addStyle({
        width: { type: DataVariableType, path: 'data2.rec2.width' },
      });

      expect(cmp.getStyle()).toEqual({ color: 'red', width: '100px' });
      dsm.get('data1').getRecord('rec1')?.set({ color: 'blue' });
      expect(cmp.getStyle()).toEqual({ color: 'blue', width: '100px' });
      dsm.get('data2').getRecord('rec2')?.set({ width: '200px' });
      expect(cmp.getStyle()).toEqual({ color: 'blue', width: '200px' });
    });

    test('updating a dynamic style with a static value using setStyle', () => {
      dsm.add({ id: 'data1', records: [{ id: 'rec1', color: 'red' }] });
      const cmp = cmpRoot.append({
        style: {
          color: { type: DataVariableType, path: 'data1.rec1.color' },
          'font-size': '12px',
        },
      })[0];
      expect(cmp.getStyle()).toEqual({ color: 'red', 'font-size': '12px' });

      cmp.setStyle({ color: 'green', 'font-size': '12px' });
      expect(cmp.getStyle()).toEqual({ color: 'green', 'font-size': '12px' });

      // The component should no longer be listening to the data source
      dsm.get('data1').getRecord('rec1')?.set({ color: 'blue' });
      expect(cmp.getStyle()).toEqual({ color: 'green', 'font-size': '12px' });
    });

    test('updating a static style with a dynamic value', () => {
      dsm.add({ id: 'data1', records: [{ id: 'rec1', color: 'red' }] });
      const cmp = cmpRoot.append({ style: { color: 'green' } })[0];
      expect(cmp.getStyle()).toEqual({ color: 'green' });

      cmp.setStyle({
        color: { type: DataVariableType, path: 'data1.rec1.color' },
      });
      expect(cmp.getStyle()).toEqual({ color: 'red' });

      dsm.get('data1').getRecord('rec1')?.set({ color: 'blue' });
      expect(cmp.getStyle()).toEqual({ color: 'blue' });
    });

    test('overwriting a dynamic style with a new dynamic style', () => {
      dsm.add({ id: 'data1', records: [{ id: 'rec1', color: 'red' }] });
      dsm.add({ id: 'data2', records: [{ id: 'rec2', color: 'purple' }] });
      const cmp = cmpRoot.append({
        style: {
          color: { type: DataVariableType, path: 'data1.rec1.color' },
        },
      })[0];
      expect(cmp.getStyle()).toEqual({ color: 'red' });

      cmp.setStyle({
        color: { type: DataVariableType, path: 'data2.rec2.color' },
      });
      expect(cmp.getStyle()).toEqual({ color: 'purple' });

      // Should no longer listen to the old data source
      dsm.get('data1').getRecord('rec1')?.set({ color: 'blue' });
      expect(cmp.getStyle()).toEqual({ color: 'purple' });

      // Should listen to the new data source
      dsm.get('data2').getRecord('rec2')?.set({ color: 'orange' });
      expect(cmp.getStyle()).toEqual({ color: 'orange' });
    });

    test('getting unresolver style values', () => {
      dsm.add({ id: 'data1', records: [{ id: 'rec1', color: 'red', width: '100px' }] });
      const color = { type: DataVariableType, path: 'data1.rec1.color' };
      const cmp = cmpRoot.append({
        style: {
          color,
        },
      })[0];
      expect(cmp.getStyle()).toEqual({ color: 'red' });
      const width = { type: DataVariableType, path: 'data1.rec1.width' };
      cmp.addStyle({ width });

      expect(cmp.getStyle({ skipResolve: true })).toEqual({ color, width });
    });
  });

  describe('.addToCollection', () => {
    test('should add a datavariable to css rule and verify via CssComposer', () => {
      const dsId = 'globalStyles';
      const drId1 = 'red-header';
      const drId2 = 'blue-paragraph';
      const selectorH1 = 'h1';
      const selectorP = 'p';

      dsm.add({
        id: dsId,
        records: [
          { id: drId1, value: 'red' },
          { id: drId2, value: 'blue' },
        ],
      });

      cmpRoot.append([
        { tagName: 'h1', type: 'text', content: 'Hello World' },
        { tagName: 'p', type: 'text', content: 'This is a paragraph.' },
      ]);

      const cssComposer = em.getEditor().CssComposer;
      const initialStyle1 = {
        color: { type: DataVariableType, path: `${dsId}.${drId1}.value` },
      };
      const initialStyle2 = {
        color: { type: DataVariableType, path: `${dsId}.${drId2}.value` },
      };

      const [rule1] = cssComposer.addCollection([{ selectors: [selectorH1], style: initialStyle1 }]);
      const [rule2] = cssComposer.addCollection([{ selectors: [selectorP], style: initialStyle2 }]);

      cssComposer.render();
      const allRules = cssComposer.getAll();

      // Verify initial resolved and unresolved styles
      expect(rule1.getStyle()).toHaveProperty('color', 'red');
      expect(rule2.getStyle()).toHaveProperty('color', 'blue');
      expect(allRules.at(0).getStyle('', { skipResolve: true })).toEqual(initialStyle1);
      expect(allRules.at(1).getStyle('', { skipResolve: true })).toEqual(initialStyle2);

      // Update data source and verify changes
      const ds = dsm.get(dsId);
      ds.getRecord(drId1)?.set({ value: 'purple' });
      ds.getRecord(drId2)?.set({ value: 'orange' });

      expect(rule1.getStyle()).toHaveProperty('color', 'purple');
      expect(allRules.at(1).getStyle()).toHaveProperty('color', 'orange');
    });
  });
});
