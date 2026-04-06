import type { CssRule, DataBindingImportContext, Editor } from '../../../src';
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

const makeTagNameVar = () => ({
  type: DataVariableType,
  path: 'records.rec1.tagName',
});

const makeColorVar = () => ({
  type: DataVariableType,
  path: 'records.rec1.color',
});

const makeKeepPropVar = () => ({
  type: DataVariableType,
  path: 'records.rec1.keepProp',
});

const makeKeepAttrVar = () => ({
  type: DataVariableType,
  path: 'records.rec1.keepAttr',
});

const makeBorderColorVar = () => ({
  type: DataVariableType,
  path: 'records.rec1.borderColor',
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
  tagName: string;
  title: string;
  color: string;
  keepProp: string;
  keepAttr: string;
  borderColor: string;
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
    record: BaseRecord = {
      id: 'rec1',
      tagName: 'div',
      title: 'Initial Title',
      color: 'red',
      keepProp: 'Initial Keep Prop',
      keepAttr: 'Initial Keep Attr',
      borderColor: 'orange',
      content: 'Dynamic Content',
    },
  ) => {
    dsm.add({
      id: 'records',
      records: [record],
    });
  };

  const createBoundComponent = () => {
    return cmpRoot.append({
      tagName: makeTagNameVar(),
      staticProp: 'staticValue',
      dsPropToKeep: makeKeepPropVar(),
      attributes: {
        id: 'bound-cmp',
        'data-attr': makeTitleVar(),
        'data-static': 'staticAttr',
        'data-keep': makeKeepAttrVar(),
      },
      style: {
        color: makeColorVar(),
        'background-color': 'black',
        'border-color': makeBorderColorVar(),
      },
    })[0];
  };

  const importStaticHtml = (
    html = '<section id="bound-cmp" data-attr="Imported Title" style="color: green;">Imported</section>',
    opts = {},
  ) => {
    cmpRoot.components().resetFromString(html, opts);
  };

  const createBoundRule = () => {
    return em.Css.addCollection([
      {
        selectors: ['.bound-rule'],
        style: {
          color: makeColorVar(),
          'background-color': 'black',
          'border-color': makeBorderColorVar(),
        },
      },
    ])[0] as CssRule;
  };

  const importStaticCss = (css = '.bound-rule { color: green; }', opts = {}) => {
    em.Css.addCollection(css, { extend: 1, ...opts });
  };

  const expectUntouchedComponentValues = (
    component: ReturnType<typeof createBoundComponent>,
    values = {
      keepProp: 'Initial Keep Prop',
      keepAttr: 'Initial Keep Attr',
      borderColor: 'orange',
    },
  ) => {
    expect(component.get('staticProp')).toBe('staticValue');
    expect(component.get('dsPropToKeep', { skipResolve: true })).toEqual(makeKeepPropVar());
    expect(component.get('dsPropToKeep')).toBe(values.keepProp);
    expect(component.getAttributes({ skipResolve: true })['data-static']).toBe('staticAttr');
    expect(component.getAttributes({ skipResolve: true })['data-keep']).toEqual(makeKeepAttrVar());
    expect(component.getAttributes()['data-keep']).toBe(values.keepAttr);
    expect(component.getStyle({ skipResolve: true })['background-color']).toBe('black');
    expect(component.getStyle({ skipResolve: true })['border-color']).toEqual(makeBorderColorVar());
    expect(component.getStyle()['border-color']).toBe(values.borderColor);
  };

  const expectUntouchedRuleValues = (
    rule: CssRule,
    values = {
      borderColor: 'orange',
    },
  ) => {
    expect(rule.getStyle('', { skipResolve: true })['background-color']).toBe('black');
    expect(rule.getStyle('', { skipResolve: true })['border-color']).toEqual(makeBorderColorVar());
    expect(rule.getStyle()['border-color']).toBe(values.borderColor);
  };

  afterEach(() => {
    editor?.destroy();
  });

  test('overwrites bound component values on parsed HTML import by default', () => {
    init();
    addBaseDataSource();
    const component = createBoundComponent();

    importStaticHtml();

    expect(component.get('tagName')).toBe('section');
    expect(component.get('tagName', { skipResolve: true })).toBeUndefined();
    expect(component.getAttributes({ skipResolve: true })['data-attr']).toBe('Imported Title');
    expect(component.getStyle({ skipResolve: true }).color).toBe('green');
    expectUntouchedComponentValues(component);

    dsm.get('records').getRecord('rec1')?.set({
      tagName: 'article',
      title: 'Changed Title',
      color: 'purple',
      keepProp: 'Changed Keep Prop',
      keepAttr: 'Changed Keep Attr',
      borderColor: 'yellow',
    });

    expect(component.get('tagName')).toBe('section');
    expect(component.getAttributes()['data-attr']).toBe('Imported Title');
    expect(component.getStyle().color).toBe('green');
    expectUntouchedComponentValues(component, {
      keepProp: 'Changed Keep Prop',
      keepAttr: 'Changed Keep Attr',
      borderColor: 'yellow',
    });
  });

  test('skips static HTML updates and preserves existing bindings', () => {
    init({
      dataSources: { dataBindingImportPolicy: 'skip' },
    });
    addBaseDataSource();
    const component = createBoundComponent();

    importStaticHtml();

    expect(component.get('tagName', { skipResolve: true })).toEqual(makeTagNameVar());
    expect(component.get('tagName')).toBe('div');
    expect(component.getAttributes({ skipResolve: true })['data-attr']).toEqual(makeTitleVar());
    expect(component.getStyle({ skipResolve: true }).color).toEqual(makeColorVar());
    expectUntouchedComponentValues(component);
    expect(dsm.getValue('records.rec1.tagName')).toBe('div');
    expect(dsm.getValue('records.rec1.title')).toBe('Initial Title');
    expect(dsm.getValue('records.rec1.color')).toBe('red');

    dsm.get('records').getRecord('rec1')?.set({
      tagName: 'article',
      title: 'Changed Title',
      color: 'purple',
      keepProp: 'Changed Keep Prop',
      keepAttr: 'Changed Keep Attr',
      borderColor: 'yellow',
    });

    expect(component.get('tagName')).toBe('article');
    expect(component.getAttributes()['data-attr']).toBe('Changed Title');
    expect(component.getStyle().color).toBe('purple');
    expectUntouchedComponentValues(component, {
      keepProp: 'Changed Keep Prop',
      keepAttr: 'Changed Keep Attr',
      borderColor: 'yellow',
    });
  });

  test('updates datasource values and keeps bindings on parsed HTML import', () => {
    init({
      dataSources: { dataBindingImportPolicy: 'update' },
    });
    addBaseDataSource();
    const component = createBoundComponent();

    importStaticHtml();

    expect(dsm.getValue('records.rec1.tagName')).toBe('section');
    expect(dsm.getValue('records.rec1.title')).toBe('Imported Title');
    expect(dsm.getValue('records.rec1.color')).toBe('green');
    expect(component.get('tagName', { skipResolve: true })).toEqual(makeTagNameVar());
    expect(component.get('tagName')).toBe('section');
    expect(component.getAttributes({ skipResolve: true })['data-attr']).toEqual(makeTitleVar());
    expect(component.getStyle({ skipResolve: true }).color).toEqual(makeColorVar());
    expectUntouchedComponentValues(component);

    dsm.get('records').getRecord('rec1')?.set({
      tagName: 'article',
      title: 'Changed Again',
      color: 'orange',
      keepProp: 'Changed Keep Prop',
      keepAttr: 'Changed Keep Attr',
      borderColor: 'yellow',
    });

    expect(component.get('tagName')).toBe('article');
    expect(component.getAttributes()['data-attr']).toBe('Changed Again');
    expect(component.getStyle().color).toBe('orange');
    expectUntouchedComponentValues(component, {
      keepProp: 'Changed Keep Prop',
      keepAttr: 'Changed Keep Attr',
      borderColor: 'yellow',
    });
  });

  test('overwrites bound rule values on parsed CSS string import by default', () => {
    init();
    addBaseDataSource();
    const rule = createBoundRule();

    importStaticCss();

    expect(rule.getStyle('', { skipResolve: true }).color).toBe('green');
    expectUntouchedRuleValues(rule);

    dsm.get('records').getRecord('rec1')?.set({ color: 'orange', borderColor: 'yellow' });

    expect(rule.getStyle().color).toBe('green');
    expectUntouchedRuleValues(rule, { borderColor: 'yellow' });
  });

  test('skips static CSS updates and preserves existing rule bindings', () => {
    init({
      dataSources: { dataBindingImportPolicy: 'skip' },
    });
    addBaseDataSource();
    const rule = createBoundRule();

    importStaticCss();

    expect(dsm.getValue('records.rec1.color')).toBe('red');
    expect(rule.getStyle('', { skipResolve: true }).color).toEqual(makeColorVar());
    expectUntouchedRuleValues(rule);

    dsm.get('records').getRecord('rec1')?.set({ color: 'orange', borderColor: 'yellow' });

    expect(rule.getStyle().color).toBe('orange');
    expectUntouchedRuleValues(rule, { borderColor: 'yellow' });
  });

  test('applies policy to parsed CSS string imports for existing rules', () => {
    init({
      dataSources: { dataBindingImportPolicy: 'update' },
    });
    addBaseDataSource();
    const rule = createBoundRule();

    importStaticCss();

    expect(dsm.getValue('records.rec1.color')).toBe('green');
    expect(rule.getStyle('', { skipResolve: true }).color).toEqual(makeColorVar());
    expectUntouchedRuleValues(rule);

    dsm.get('records').getRecord('rec1')?.set({ color: 'orange', borderColor: 'yellow' });

    expect(rule.getStyle().color).toBe('orange');
    expectUntouchedRuleValues(rule, { borderColor: 'yellow' });
  });

  test('supports callback policies per key and kind', () => {
    init({
      dataSources: {
        dataBindingImportPolicy: ({ key, kind, source }: DataBindingImportContext) => {
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

    expect(dsm.getValue('records.rec1.tagName')).toBe('section');
    expect(dsm.getValue('records.rec1.title')).toBe('Initial Title');
    expect(dsm.getValue('records.rec1.color')).toBe('green');
    expect(component.get('tagName', { skipResolve: true })).toEqual(makeTagNameVar());
    expect(component.get('tagName')).toBe('section');
    expect(component.getAttributes({ skipResolve: true })['data-attr']).toEqual(makeTitleVar());
    expect(component.getStyle({ skipResolve: true }).color).toEqual(makeColorVar());
    expectUntouchedComponentValues(component);
  });

  test('supports per-call override on parsed HTML import', () => {
    init({
      dataSources: { dataBindingImportPolicy: 'skip' },
    });
    addBaseDataSource();
    const component = createBoundComponent();

    importStaticHtml(undefined, { dataBindingImportPolicy: 'update' });

    expect(dsm.getValue('records.rec1.tagName')).toBe('section');
    expect(dsm.getValue('records.rec1.title')).toBe('Imported Title');
    expect(dsm.getValue('records.rec1.color')).toBe('green');
    expect(component.get('tagName', { skipResolve: true })).toEqual(makeTagNameVar());
    expect(component.get('tagName')).toBe('section');
    expect(component.getAttributes({ skipResolve: true })['data-attr']).toEqual(makeTitleVar());
    expect(component.getStyle({ skipResolve: true }).color).toEqual(makeColorVar());
  });

  test('supports per-call override on parsed CSS import', () => {
    init({
      dataSources: { dataBindingImportPolicy: 'skip' },
    });
    addBaseDataSource();
    const rule = createBoundRule();

    importStaticCss(undefined, { dataBindingImportPolicy: 'update' });

    expect(dsm.getValue('records.rec1.color')).toBe('green');
    expect(rule.getStyle('', { skipResolve: true }).color).toEqual(makeColorVar());
    expect(rule.getStyle().color).toBe('green');
    expectUntouchedRuleValues(rule);
  });

  test('keeps bindings and warns when update cannot write data-condition values', () => {
    init({
      dataSources: { dataBindingImportPolicy: 'update' },
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
      dataSources: { dataBindingImportPolicy: 'update' },
    });
    addBaseDataSource({
      id: 'rec1',
      tagName: 'div',
      title: 'Initial Title',
      color: 'red',
      keepProp: 'Initial Keep Prop',
      keepAttr: 'Initial Keep Attr',
      borderColor: 'orange',
      content: 'Dynamic Content',
      mutable: false,
    });
    const warningSpy = jest.spyOn(em, 'logWarning');
    const rule = createBoundRule();

    importStaticCss();

    expect(rule.getStyle('', { skipResolve: true }).color).toEqual(makeColorVar());
    expect(rule.getStyle().color).toBe('red');
    expect(warningSpy).toHaveBeenCalled();
  });

  test('does not change direct setter overwrite behavior', () => {
    init({
      dataSources: { dataBindingImportPolicy: 'skip' },
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
