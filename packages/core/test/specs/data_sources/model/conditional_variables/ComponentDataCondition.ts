import { Component, Components, ComponentView, DataSourceManager, Editor } from '../../../../../src';
import { DataConditionIfTrueType } from '../../../../../src/data_sources/model/conditional_variables/constants';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import { DataConditionType } from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { AnyTypeOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/AnyTypeOperator';
import { NumberOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/NumberOperator';
import ComponentDataConditionView from '../../../../../src/data_sources/view/ComponentDataConditionView';
import ComponentWrapper from '../../../../../src/dom_components/model/ComponentWrapper';
import EditorModel from '../../../../../src/editor/model/Editor';
import {
  FALSE_CONDITION,
  ifFalseComponentDef,
  ifFalseText,
  ifTrueComponentDef,
  ifTrueText,
  isObjectContained,
  setupTestEditor,
  TRUE_CONDITION,
} from '../../../../common';
import ComponentDataCondition from '../../../../../src/data_sources/model/conditional_variables/ComponentDataCondition';

describe('ComponentDataCondition', () => {
  let editor: Editor;
  let em: EditorModel;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    ({ editor, em, dsm, cmpRoot } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  it('should add a component with a condition', () => {
    const component = cmpRoot.append({
      type: DataConditionType,
      dataResolver: { condition: TRUE_CONDITION },
      components: [ifTrueComponentDef],
    })[0] as ComponentDataCondition;
    expect(component).toBeDefined();
    expect(component.get('type')).toBe(DataConditionType);
    const componentView = component.getView();
    expect(componentView).toBeInstanceOf(ComponentDataConditionView);

    expect(component.getInnerHTML()).toContain(ifTrueText);
    expect(component.getEl()?.innerHTML).toContain(ifTrueText);
    const ifTrueContent = component.getIfTrueContent()!;
    expect(ifTrueContent.getInnerHTML()).toContain(ifTrueText);
    expect(ifTrueContent.getEl()?.textContent).toBe(ifTrueText);
    expect(ifTrueContent.getEl()?.style.display).toBe('');
  });

  it('ComponentDataCondition getIfTrueContent and getIfFalseContent', () => {
    const component = cmpRoot.append({
      type: DataConditionType,
      dataResolver: { condition: TRUE_CONDITION },
      components: [ifTrueComponentDef, ifFalseComponentDef],
    })[0] as ComponentDataCondition;

    expect(JSON.parse(JSON.stringify(component.getIfTrueContent()!))).toEqual(ifTrueComponentDef);
    expect(JSON.parse(JSON.stringify(component.getIfFalseContent()!))).toEqual(ifFalseComponentDef);
  });

  it('should test component variable with data-source', () => {
    const dataSource = {
      id: 'ds1',
      records: [
        { id: 'left_id', left: 'Name1' },
        { id: 'right_id', right: 'Name1' },
      ],
    };
    dsm.add(dataSource);

    const component = cmpRoot.append({
      type: DataConditionType,
      dataResolver: {
        condition: {
          left: {
            type: DataVariableType,
            path: 'ds1.left_id.left',
          },
          operator: AnyTypeOperation.equals,
          right: {
            type: DataVariableType,
            path: 'ds1.right_id.right',
          },
        },
      },
      components: [ifTrueComponentDef, ifFalseComponentDef],
    })[0] as ComponentDataCondition;
    expect(component.getInnerHTML()).toContain(ifTrueText);
    expect(component.getEl()?.innerHTML).toContain(ifTrueText);
    const ifTrueContent = component.getIfTrueContent()!;
    expect(ifTrueContent.getInnerHTML()).toContain(ifTrueText);
    expect(ifTrueContent.getEl()?.textContent).toBe(ifTrueText);
    expect(ifTrueContent.getEl()?.style.display).toBe('');

    expect(component.getInnerHTML()).not.toContain(ifFalseText);
    expect(component.getEl()?.innerHTML).toContain(ifFalseText);
    const ifFalseContent = component.getIfFalseContent()!;
    expect(ifFalseContent.getInnerHTML()).toContain(ifFalseText);
    expect(ifFalseContent.getEl()?.textContent).toBe(ifFalseText);
    expect(ifFalseContent.getEl()?.style.display).toBe('none');

    /* Test changing datasources */
    const WrongValue = 'Diffirent value';
    changeDataSourceValue(dsm, WrongValue);
    expect(component.getEl()?.innerHTML).toContain(ifTrueText);
    expect(component.getEl()?.innerHTML).toContain(ifFalseText);
    expect(ifTrueContent.getEl()?.style.display).toBe('none');
    expect(ifFalseContent.getEl()?.style.display).toBe('');

    const CorrectValue = 'Name1';
    changeDataSourceValue(dsm, CorrectValue);
    expect(component.getEl()?.innerHTML).toContain(ifTrueText);
    expect(component.getEl()?.innerHTML).toContain(ifFalseText);
    expect(ifTrueContent.getEl()?.style.display).toBe('');
    expect(ifFalseContent.getEl()?.style.display).toBe('none');
  });

  it('should test a conditional component with a child that is also a conditional component', () => {
    const dataSource = {
      id: 'ds1',
      records: [
        { id: 'left_id', left: 'Name1' },
        { id: 'right_id', right: 'Name1' },
      ],
    };
    dsm.add(dataSource);

    const component = cmpRoot.append({
      type: DataConditionType,
      dataResolver: {
        condition: {
          left: {
            type: DataVariableType,
            path: 'ds1.left_id.left',
          },
          operator: AnyTypeOperation.equals,
          right: {
            type: DataVariableType,
            path: 'ds1.right_id.right',
          },
        },
      },
      components: [
        {
          type: DataConditionIfTrueType,
          components: {
            type: DataConditionType,
            dataResolver: {
              condition: {
                left: {
                  type: DataVariableType,
                  path: 'ds1.left_id.left',
                },
                operator: AnyTypeOperation.equals,
                right: {
                  type: DataVariableType,
                  path: 'ds1.right_id.right',
                },
              },
            },
            components: ifTrueComponentDef,
          },
        },
        ifFalseComponentDef,
      ],
    })[0] as ComponentDataCondition;
    const ifTrueContent = component.getIfTrueContent()!;
    expect(ifTrueContent.getInnerHTML()).toContain(ifTrueText);
    expect(ifTrueContent.getEl()?.textContent).toBe(ifTrueText);
    expect(ifTrueContent.getEl()?.style.display).toBe('');
  });

  it('should store conditional components', () => {
    const conditionalCmptDef = {
      type: DataConditionType,
      dataResolver: { condition: FALSE_CONDITION },
      components: [ifTrueComponentDef, ifFalseComponentDef],
    };

    cmpRoot.append(conditionalCmptDef)[0];

    const projectData = editor.getProjectData();
    const page = projectData.pages[0];
    const frame = page.frames[0];
    const storageCmptDef = frame.component.components[0];
    expect(isObjectContained(storageCmptDef, conditionalCmptDef)).toBe(true);
  });

  it('should dynamically display ifTrue, ifFalse components in the correct order', () => {
    const component = cmpRoot.append({
      type: DataConditionType,
      dataResolver: { condition: TRUE_CONDITION },
      components: [ifTrueComponentDef, ifFalseComponentDef],
    })[0] as ComponentDataCondition;
    const el = component.getEl()!;
    const ifTrueEl = el.childNodes[0] as any;
    const ifFalseEl = el.childNodes[1] as any;
    expect(ifTrueEl.textContent).toContain(ifTrueText);
    expect(ifTrueEl.style.display).toBe('');
    expect(ifFalseEl.textContent).toContain(ifFalseText);
    expect(ifFalseEl.style.display).toBe('none');

    component.setCondition(FALSE_CONDITION);
    expect(ifTrueEl.style.display).toBe('none');
    expect(ifTrueEl.textContent).toContain(ifTrueText);
    expect(ifFalseEl.style.display).toBe('');
    expect(ifFalseEl.textContent).toContain(ifFalseText);
  });

  it('should dynamically update display components when data source changes', () => {
    const dataSource = {
      id: 'ds1',
      records: [{ id: 'left_id', left: 1 }],
    };
    dsm.add(dataSource);

    const component = cmpRoot.append({
      type: DataConditionType,
      dataResolver: {
        condition: {
          left: {
            type: DataVariableType,
            path: 'ds1.left_id.left',
          },
          operator: NumberOperation.greaterThan,
          right: 0,
        },
      },
      components: [ifTrueComponentDef, ifFalseComponentDef],
    })[0] as ComponentDataCondition;

    const el = component.view!.el!;
    const falseValue = -1;
    changeDataSourceValue(dsm, falseValue);
    expect(el.innerHTML).toContain(ifTrueText);
    expect(el.innerHTML).toContain(ifFalseText);

    const ifTrueEl = el.childNodes[0] as any;
    const ifFalseEl = el.childNodes[1] as any;
    expect(ifTrueEl!.style.display).toBe('none');
    expect(ifTrueEl.textContent).toContain(ifTrueText);
    expect(ifFalseEl.style.display).toBe('');
    expect(ifFalseEl.textContent).toContain(ifFalseText);
  });

  it('should update content of ifTrue, ifFalse components when condition changes', () => {
    const component = cmpRoot.append({
      type: DataConditionType,
      dataResolver: { condition: TRUE_CONDITION },
      components: [ifTrueComponentDef, ifFalseComponentDef],
    })[0] as ComponentDataCondition;
    const el = component.view!.el;

    component.setCondition(FALSE_CONDITION);
    const ifTrueEl = el.childNodes[0] as any;
    const ifFalseEl = el.childNodes[1] as any;
    expect(ifTrueEl!.style.display).toBe('none');
    expect(ifTrueEl.textContent).toContain(ifTrueText);
    expect(ifFalseEl.style.display).toBe('');
    expect(ifFalseEl.textContent).toContain(ifFalseText);
  });

  test("fixes: ComponentDatacondition dataResolver type 'data-variable' issue", () => {
    const dataResolver = {
      type: DataConditionType,
      condition: {
        left: 1,
        operator: NumberOperation.greaterThan,
        right: 0,
      },
    };
    const cmp = cmpRoot.append({
      type: DataConditionType,
      dataResolver,
      components: [ifTrueComponentDef, ifFalseComponentDef],
    })[0] as ComponentDataCondition;

    expect(cmp.getDataResolver()).toBe(dataResolver);
  });
});

function changeDataSourceValue(dsm: DataSourceManager, newValue: string | number) {
  dsm.get('ds1').getRecord('left_id')?.set('left', newValue);
}
