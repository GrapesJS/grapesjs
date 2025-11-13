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

  const makeColorVar = () => ({
    type: DataVariableType,
    path: 'ds1.rec1.color',
  });
  const makeTitleVar = () => ({
    type: DataVariableType,
    path: 'ds1.rec1.title',
  });
  const makeContentVar = () => ({
    type: DataVariableType,
    path: 'ds1.rec1.content',
  });

  beforeEach(() => {
    ({ editor, um, dsm } = setupTestEditor({ withCanvas: true }));
    wrapper = editor.getWrapper()!;
    dsm.add({
      id: 'ds1',
      records: [{ id: 'rec1', color: 'red', title: 'Initial Title', content: 'Initial Content' }],
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Initial State with Data Binding', () => {
    it('should correctly initialize with a component having data-bound properties', () => {
      const component = wrapper.append({
        style: { color: makeColorVar() },
        attributes: { title: makeTitleVar() },
        content: makeContentVar(),
      })[0];

      expect(um.getStackGroup()).toHaveLength(1);
      um.undo();
      um.redo();
      expect(component.getStyle().color).toBe('red');
      expect(component.getAttributes().title).toBe('Initial Title');
      expect(component.get('content')).toBe('Initial Content');
      expect(um.getStackGroup()).toHaveLength(1);
    });
  });

  describe('Core Undo/Redo on Component Data Binding', () => {
    describe('Styles', () => {
      it('should undo and redo the assignment of a data value to a style', () => {
        const component = wrapper.append({
          content: makeContentVar(),
          style: { color: 'blue', 'font-size': '12px' },
        })[0];

        jest.runAllTimers();
        um.clear();
        component.setStyle({ color: makeColorVar() });
        expect(component.getStyle().color).toBe('red');
        expect(component.getStyle({ skipResolve: true }).color).toEqual(makeColorVar());

        um.undo();
        expect(component.getStyle().color).toBe('blue');
        expect(component.getStyle({ skipResolve: true }).color).toBe('blue');

        um.redo();
        expect(component.getStyle().color).toBe('red');
        expect(component.getStyle({ skipResolve: true }).color).toEqual(makeColorVar());
      });

      it('should handle binding with a data-condition value', () => {
        const component = wrapper.append({ content: 'some content', style: { color: 'blue' } })[0];
        const conditionVar = {
          type: DataConditionType,
          condition: { left: makeTitleVar(), operator: StringOperation.contains, right: 'Initial' },
          ifTrue: 'green',
          ifFalse: 'purple',
        };

        jest.runAllTimers();
        um.clear();

        component.addStyle({ color: conditionVar });
        expect(component.getStyle().color).toBe('green');

        um.undo();
        expect(component.getStyle().color).toBe('blue');

        um.redo();
        expect(component.getStyle().color).toBe('green');
      });
    });

    describe('Attributes', () => {
      it('should undo and redo the assignment of a data value to an attribute', () => {
        const component = wrapper.append({ attributes: { title: 'Static Title' } })[0];

        jest.runAllTimers();
        um.clear();

        component.setAttributes({ title: makeTitleVar() });
        expect(component.getAttributes().title).toBe('Initial Title');

        um.undo();
        expect(component.getAttributes().title).toBe('Static Title');

        um.redo();
        expect(component.getAttributes().title).toBe('Initial Title');
      });
    });

    describe('Properties', () => {
      it('should undo and redo the assignment of a data value to a property', () => {
        const component = wrapper.append({ content: 'Static Content' })[0];

        jest.runAllTimers();
        um.clear();

        component.set({ content: makeContentVar() });
        expect(component.get('content')).toBe('Initial Content');

        um.undo();
        expect(component.get('content')).toBe('Static Content');

        um.redo();
        expect(component.get('content')).toBe('Initial Content');
      });
    });
  });

  describe('Value Overwriting Scenarios', () => {
    it('should correctly undo a static style that overwrites a data binding', () => {
      const component = wrapper.append({
        style: { color: makeColorVar() },
        attributes: { title: 'Static Title' },
      })[0];

      jest.runAllTimers();
      um.clear();

      component.addStyle({ color: 'green' });
      expect(component.getStyle().color).toBe('green');

      um.undo();
      expect(component.getStyle().color).toBe('red');
      expect(component.getAttributes().title).toBe('Static Title');
    });

    it('should correctly undo a data binding that overwrites a static style', () => {
      const component = wrapper.append({ style: { color: 'green' } })[0];

      jest.runAllTimers();
      um.clear();

      component.addStyle({ color: makeColorVar() });
      expect(component.getStyle().color).toBe('red');

      um.undo();
      expect(component.getStyle().color).toBe('green');
    });
  });

  describe('Listeners & Data Source Integrity', () => {
    it('should maintain listeners after a binding is restored via undo', () => {
      const component = wrapper.append({ style: { color: makeColorVar() } })[0];

      jest.runAllTimers();
      um.clear();

      component.addStyle({ color: 'green' });
      expect(component.getStyle().color).toBe('green');

      um.undo();
      expect(component.getStyle().color).toBe('red');

      dsm.get('ds1').getRecord('rec1')!.set('color', 'purple');
      expect(component.getStyle().color).toBe('purple');
    });

    it('should handle undo when the data source has been removed', () => {
      const component = wrapper.append({ style: { color: makeColorVar() } })[0];
      expect(component.getStyle().color).toBe('red');

      jest.runAllTimers();
      um.clear();

      dsm.remove('ds1');
      expect(component.getStyle().color).toBeUndefined();

      um.undo();
      expect(dsm.get('ds1')).toBeTruthy();
      expect(component.getStyle().color).toBe('red');
    });
  });

  describe('Serialization & Cloning', () => {
    let component: any;

    beforeEach(() => {
      component = wrapper.append({
        style: { color: makeColorVar() },
        attributes: { title: makeTitleVar() },
        content: makeContentVar(),
      })[0];
    });

    it('should correctly serialize data bindings in toJSON()', () => {
      const json = component.toJSON();
      expect(json.attributes.title).toEqual(makeTitleVar());
      expect(json.__dynamicProps).toBeUndefined();
    });

    it('should correctly clone data bindings', () => {
      const clone = component.clone();
      expect(clone.getStyle('', { skipResolve: true }).color).toEqual(makeColorVar());
      expect(clone.getAttributes({ skipResolve: true }).title).toEqual(makeTitleVar());
      expect(clone.get('content', { skipResolve: true })).toEqual(makeContentVar());
      expect(clone.getStyle().color).toBe('red');
    });

    it('should ensure a cloned component has an independent undo history', () => {
      const clone = component.clone();
      wrapper.append(clone);

      jest.runAllTimers();
      um.clear();

      component.addStyle({ color: 'blue' });
      expect(um.hasUndo()).toBe(true);
      expect(clone.getStyle().color).toBe('red');

      um.undo();
      expect(component.getStyle().color).toBe('red');
      expect(clone.getStyle().color).toBe('red');
    });
  });
});
