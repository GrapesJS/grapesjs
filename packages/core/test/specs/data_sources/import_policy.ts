import type { CssRule, DataSourcePropertyContext, Editor } from '../../../src';
import type DataSourceManager from '../../../src/data_sources';
import { DataConditionType } from '../../../src/data_sources/model/conditional_variables/DataCondition';
import { StringOperation } from '../../../src/data_sources/model/conditional_variables/operators/StringOperator';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import type EditorModel from '../../../src/editor/model/Editor';
import type { EditorConfig } from '../../../src/editor/config/config';
import type ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { setupTestEditor } from '../../common';

const makeTitleVar = () => ({
  type: DataVariableType,
  path: 'records.rec1.title',
});

const makeColorVar = () => ({
  type: DataVariableType,
  path: 'records.rec1.color',
});

const makeContentVar = () => ({
  type: DataVariableType,
  path: 'records.rec1.content',
});

const makeConditionVar = () => ({
  type: DataConditionType,
  condition: {
    left: makeTitleVar(),
    operator: StringOperation.contains,
    right: 'Initial',
  },
  ifTrue: 'red',
  ifFalse: 'blue',
});

type BaseRecord = {
  id: string;
  title: string;
  color: string;
  content: string;
  mutable?: boolean;
};

describe('Data source import policy', () => {
  let editor: Editor;
  let em: EditorModel;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;

  const init = (config: Partial<EditorConfig> = {}) => {
    ({ editor, em, dsm, cmpRoot } = setupTestEditor({ config }));
  };

  const addBaseDataSource = (
    record: BaseRecord = { id: 'rec1', title: 'Initial Title', color: 'red', content: 'Dynamic Content' },
  ) => {
    dsm.add({
      id: 'records',
      records: [record],
    });
  };

  const createBoundComponent = () => {
    return cmpRoot.append({
      tagName: 'div',
      attributes: { id: 'bound-cmp', 'data-attr': makeTitleVar() },
      style: { color: makeColorVar() },
    })[0];
  };

  const importStaticHtml = (
    html = '<div id="bound-cmp" data-attr="Imported Title" style="color: green;">Imported</div>',
  ) => {
    cmpRoot.components().resetFromString(html);
  };

  const createBoundRule = () => {
    return em.Css.addCollection([
      {
        selectors: ['.bound-rule'],
        style: { color: makeColorVar() },
      },
    ])[0] as CssRule;
  };

  const importStaticCss = (css = '.bound-rule { color: green; }') => {
    em.Css.addCollection(css);
  };

  afterEach(() => {
    editor?.destroy();
  });

  test('overwrites bound component values on parsed HTML import by default', () => {
    init();
    addBaseDataSource();
    const component = createBoundComponent();

    importStaticHtml();

    expect(component.getAttributes({ skipResolve: true })['data-attr']).toBe('Imported Title');
    expect(component.getStyle({ skipResolve: true }).color).toBe('green');

    dsm.get('records').getRecord('rec1')?.set({ title: 'Changed Title', color: 'purple' });

    expect(component.getAttributes()['data-attr']).toBe('Imported Title');
    expect(component.getStyle().color).toBe('green');
  });

  test('skips static HTML updates and preserves existing bindings', () => {
    init({
      dataSources: { onDataSourceProperty: 'skip' },
    });
    addBaseDataSource();
    const component = createBoundComponent();

    importStaticHtml();

    expect(component.getAttributes({ skipResolve: true })['data-attr']).toEqual(makeTitleVar());
    expect(component.getStyle({ skipResolve: true }).color).toEqual(makeColorVar());
    expect(dsm.getValue('records.rec1.title')).toBe('Initial Title');
    expect(dsm.getValue('records.rec1.color')).toBe('red');

    dsm.get('records').getRecord('rec1')?.set({ title: 'Changed Title', color: 'purple' });

    expect(component.getAttributes()['data-attr']).toBe('Changed Title');
    expect(component.getStyle().color).toBe('purple');
  });

  test('updates datasource values and keeps bindings on parsed HTML import', () => {
    init({
      dataSources: { onDataSourceProperty: 'update' },
    });
    addBaseDataSource();
    const component = createBoundComponent();

    importStaticHtml();

    expect(dsm.getValue('records.rec1.title')).toBe('Imported Title');
    expect(dsm.getValue('records.rec1.color')).toBe('green');
    expect(component.getAttributes({ skipResolve: true })['data-attr']).toEqual(makeTitleVar());
    expect(component.getStyle({ skipResolve: true }).color).toEqual(makeColorVar());

    dsm.get('records').getRecord('rec1')?.set({ title: 'Changed Again', color: 'orange' });

    expect(component.getAttributes()['data-attr']).toBe('Changed Again');
    expect(component.getStyle().color).toBe('orange');
  });

  test('overwrites bound rule values on parsed CSS string import by default', () => {
    init();
    addBaseDataSource();
    const rule = createBoundRule();

    importStaticCss();

    expect(rule.getStyle('', { skipResolve: true }).color).toBe('green');

    dsm.get('records').getRecord('rec1')?.set({ color: 'orange' });

    expect(rule.getStyle().color).toBe('green');
  });

  test('skips static CSS updates and preserves existing rule bindings', () => {
    init({
      dataSources: { onDataSourceProperty: 'skip' },
    });
    addBaseDataSource();
    const rule = createBoundRule();

    importStaticCss();

    expect(dsm.getValue('records.rec1.color')).toBe('red');
    expect(rule.getStyle('', { skipResolve: true }).color).toEqual(makeColorVar());

    dsm.get('records').getRecord('rec1')?.set({ color: 'orange' });

    expect(rule.getStyle().color).toBe('orange');
  });

  test('applies policy to parsed CSS string imports for existing rules', () => {
    init({
      dataSources: { onDataSourceProperty: 'update' },
    });
    addBaseDataSource();
    const rule = createBoundRule();

    importStaticCss();

    expect(dsm.getValue('records.rec1.color')).toBe('green');
    expect(rule.getStyle('', { skipResolve: true }).color).toEqual(makeColorVar());

    dsm.get('records').getRecord('rec1')?.set({ color: 'orange' });

    expect(rule.getStyle().color).toBe('orange');
  });

  test('supports callback policies per key and kind', () => {
    init({
      dataSources: {
        onDataSourceProperty: ({ key, kind, source }: DataSourcePropertyContext) => {
          if (source === 'html' && kind === 'attribute' && key === 'data-attr') {
            return 'skip';
          }

          return 'update';
        },
      },
    });
    addBaseDataSource();
    const component = createBoundComponent();

    importStaticHtml();

    expect(dsm.getValue('records.rec1.title')).toBe('Initial Title');
    expect(dsm.getValue('records.rec1.color')).toBe('green');
    expect(component.getAttributes({ skipResolve: true })['data-attr']).toEqual(makeTitleVar());
    expect(component.getStyle({ skipResolve: true }).color).toEqual(makeColorVar());
  });

  test('keeps bindings and warns when update cannot write data-condition values', () => {
    init({
      dataSources: { onDataSourceProperty: 'update' },
    });
    addBaseDataSource();
    const warningSpy = jest.spyOn(em, 'logWarning');
    const component = cmpRoot.append({
      tagName: 'div',
      attributes: { id: 'bound-cmp' },
      style: { color: makeConditionVar() },
    })[0];

    cmpRoot.components().resetFromString('<div id="bound-cmp" style="color: black;"></div>');

    expect(component.getStyle({ skipResolve: true }).color).toEqual(makeConditionVar());
    expect(component.getStyle().color).toBe('red');
    expect(warningSpy).toHaveBeenCalled();

    dsm.get('records').getRecord('rec1')?.set({ title: 'No Match' });

    expect(component.getStyle().color).toBe('blue');
  });

  test('keeps bindings and warns when datasource updates fail', () => {
    init({
      dataSources: { onDataSourceProperty: 'update' },
    });
    addBaseDataSource({ id: 'rec1', title: 'Initial Title', color: 'red', content: 'Dynamic Content', mutable: false });
    const warningSpy = jest.spyOn(em, 'logWarning');
    const rule = createBoundRule();

    importStaticCss();

    expect(rule.getStyle('', { skipResolve: true }).color).toEqual(makeColorVar());
    expect(rule.getStyle().color).toBe('red');
    expect(warningSpy).toHaveBeenCalled();
  });

  test('does not change direct setter overwrite behavior', () => {
    init({
      dataSources: { onDataSourceProperty: 'skip' },
    });
    addBaseDataSource();
    const component = createBoundComponent();
    component.set('content', makeContentVar());
    const rule = createBoundRule();

    component.addAttributes({ 'data-attr': 'Static Title' });
    component.addStyle({ color: 'green' });
    component.set('content', 'Static Content');
    rule.addStyle({ color: 'blue' });

    dsm.get('records').getRecord('rec1')?.set({ title: 'Changed Title', color: 'orange', content: 'Changed Content' });

    expect(component.getAttributes({ skipResolve: true })['data-attr']).toBe('Static Title');
    expect(component.getStyle({ skipResolve: true }).color).toBe('green');
    expect(component.get('content', { skipResolve: true })).toBeUndefined();
    expect(rule.getStyle('', { skipResolve: true }).color).toBe('blue');
    expect(component.getAttributes()['data-attr']).toBe('Static Title');
    expect(component.getStyle().color).toBe('green');
    expect(component.get('content')).toBe('Static Content');
    expect(rule.getStyle().color).toBe('blue');
  });
});
