import { Component, DataSourceManager, Editor } from '../../../src';
import { DataConditionType } from '../../../src/data_sources/model/conditional_variables/DataCondition';
import { StringOperation } from '../../../src/data_sources/model/conditional_variables/operators/StringOperator';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import UndoManager from '../../../src/undo_manager';
import { setupTestEditor } from '../../common';

describe('Undo Manager with Data Binding', () => {
  let editor: Editor;
  let um: UndoManager;
  let wrapper: Component;
  let dsm: DataSourceManager;

  const colorVar = {
    type: DataVariableType,
    path: 'ds1.rec1.color',
  };
  const titleVar = {
    type: DataVariableType,
    path: 'ds1.rec1.title',
  };
  const contentVar = {
    type: DataVariableType,
    path: 'ds1.rec1.content',
  };

  beforeEach(() => {
    ({ editor, um, dsm } = setupTestEditor({
      withCanvas: true,
    }));
    wrapper = editor.getWrapper()!;
    editor.on('', (rule) => um.add(rule));
    dsm.add({
      id: 'ds1',
      records: [{ id: 'rec1', color: 'red', title: 'Initial Title', content: 'Initial Content' }],
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Initial State with Data Binding', () => {
    it('should correctly initialize with a component having data-bound properties', (done) => {
      const component = wrapper.append({
        style: { color: colorVar },
        attributes: { title: titleVar },
        content: contentVar,
      })[0];

      setTimeout(() => {
        expect(um.getStackGroup()).toHaveLength(1);
        um.undo();
        um.redo();
        expect(component.getStyle().color).toBe('red');
        expect(component.getAttributes().title).toBe('Initial Title');
        expect(component.get('content')).toBe('Initial Content');
        expect(um.getStackGroup()).toHaveLength(1);
        done();
      });
    });
  });

  describe('Core Undo/Redo on Component Data Binding', () => {
    describe('Styles', () => {
      it('should undo and redo the assignment of a data value to a style', (done) => {
        const component = wrapper.append({ content: contentVar, style: { color: 'blue', 'font-size': '12px' } })[0];

        setTimeout(() => {
          component.setStyle({ color: colorVar });
          expect(component.getStyle().color).toBe('red');
          expect(component.getStyle({ skipResolve: true }).color).toEqual(colorVar);

          um.undo();
          expect(component.getStyle().color).toBe('blue');
          expect(component.getStyle({ skipResolve: true }).color).toBe('blue');

          um.redo();
          expect(component.getStyle().color).toBe('red');
          expect(component.getStyle({ skipResolve: true }).color).toEqual(colorVar);
          done();
        });
      });

      it('should handle binding with a data-condition value', (done) => {
        const component = wrapper.append({ content: 'some content', style: { color: 'blue' } })[0];
        const conditionVar = {
          type: DataConditionType,
          condition: { left: titleVar, operator: StringOperation.contains, right: 'Initial' },
          ifTrue: 'green',
          ifFalse: 'purple',
        };
        setTimeout(() => {
          um.clear();

          component.addStyle({ color: conditionVar });
          expect(component.getStyle().color).toBe('green');

          um.undo();
          expect(component.getStyle().color).toBe('blue');

          um.redo();
          expect(component.getStyle().color).toBe('green');
          done();
        });
      });
    });

    describe('Attributes', () => {
      it('should undo and redo the assignment of a data value to an attribute', (done) => {
        const component = wrapper.append({ attributes: { title: 'Static Title' } })[0];
        setTimeout(() => {
          um.clear();

          component.setAttributes({ title: titleVar });
          expect(component.getAttributes().title).toBe('Initial Title');

          um.undo();
          expect(component.getAttributes().title).toBe('Static Title');

          um.redo();
          expect(component.getAttributes().title).toBe('Initial Title');
          done();
        });
      });
    });

    describe('Properties', () => {
      it('should undo and redo the assignment of a data value to a property', (done) => {
        const component = wrapper.append({ content: 'Static Content' })[0];
        setTimeout(() => {
          um.clear();

          component.set({ content: contentVar });
          expect(component.get('content')).toBe('Initial Content');

          um.undo();
          expect(component.get('content')).toBe('Static Content');

          um.redo();
          expect(component.get('content')).toBe('Initial Content');
          done();
        });
      });
    });
  });

  // ## 3. Value Overwriting Scenarios
  // --------------------------------------------------------------------------------

  describe('Value Overwriting Scenarios', () => {
    it('should correctly undo a static style that overwrites a data binding', (done) => {
      const component = wrapper.append({
        style: { color: colorVar },
        attributes: { title: 'Static Title' },
      })[0];
      setTimeout(() => {
        um.clear();

        component.addStyle({ color: 'green' });
        expect(component.getStyle().color).toBe('green');

        um.undo();
        expect(component.getStyle().color).toBe('red');
        // Ensure other properties are untouched
        expect(component.getAttributes().title).toBe('Static Title');
        done();
      });
    });

    it('should correctly undo a data binding that overwrites a static style', (done) => {
      const component = wrapper.append({ style: { color: 'green' } })[0];
      setTimeout(() => {
        um.clear();

        component.addStyle({ color: colorVar });
        expect(component.getStyle().color).toBe('red');

        um.undo();
        expect(component.getStyle().color).toBe('green');
        done();
      });
    });
  });

  // ## 4. Listeners & Data Source Integrity
  // --------------------------------------------------------------------------------

  describe('Listeners & Data Source Integrity', () => {
    it('should maintain listeners after a binding is restored via undo', () => {
      const component = wrapper.append({ style: { color: colorVar } })[0];
      setTimeout(() => {
        um.clear();

        // Overwrite binding with static value
        component.addStyle({ color: 'green' });
        expect(component.getStyle().color).toBe('green');

        // Undo the overwrite
        um.undo();
        expect(component.getStyle().color).toBe('red');

        // Change the source data; the listener should be active
        dsm.get('ds1').getRecord('rec1')!.set('color', 'purple');
        expect(component.getStyle().color).toBe('purple');
      });
    });

    it('should handle undo when the data source has been removed', () => {
      const component = wrapper.append({ style: { color: colorVar } })[0];
      expect(component.getStyle().color).toBe('red');
      setTimeout(() => {
        um.clear();

        // Remove the data source
        dsm.remove('ds1');
        // Style should fall back to its default (undefined in this case)
        expect(component.getStyle().color).toBeUndefined();

        // Undo the removal of the data source
        um.undo();
        expect(dsm.get('ds1')).toBeTruthy();
        // The component should re-bind and get the correct value
        expect(component.getStyle().color).toBe('red');
      });
    });
  });

  // ## 5. Serialization & Cloning
  // --------------------------------------------------------------------------------

  describe('Serialization & Cloning', () => {
    let component: any;

    beforeEach(() => {
      component = wrapper.append({
        style: { color: colorVar },
        attributes: { title: titleVar },
        content: contentVar,
      })[0];
    });

    it('should correctly serialize data bindings in toJSON()', (done) => {
      const json = component.toJSON();
      // Check for one of the bindings
      expect(json.attributes.title).toEqual(titleVar);
      // Check that internal properties are not present
      expect(json.__dynamicProps).toBeUndefined();
      done();
    });

    it('should correctly clone data bindings', (done) => {
      const clone = component.clone();
      expect(clone.getStyle('', { skipResolve: true }).color).toEqual(colorVar);
      expect(clone.getAttributes({ skipResolve: true }).title).toEqual(titleVar);
      expect(clone.get('content', { skipResolve: true })).toEqual(contentVar);

      // Verify resolved values on clone
      expect(clone.getStyle().color).toBe('red');
      done();
    });

    it('should ensure a cloned component has an independent undo history', (done) => {
      const clone = component.clone();
      wrapper.append(clone);
      setTimeout(() => {
        um.clear();

        // Modify original
        component.addStyle({ color: 'blue' });
        expect(um.hasUndo()).toBe(true);

        // Clone should be unaffected
        expect(clone.getStyle().color).toBe('red');

        // Undo should only affect the original
        um.undo();
        expect(component.getStyle().color).toBe('red');
        expect(clone.getStyle().color).toBe('red');
        done();
      });
    });
  });
});
