import { Component, DataSourceManager, Editor } from '../../../../../src';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import { MissingConditionError } from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { ConditionalVariableType } from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { GenericOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/GenericOperator';
import { NumberOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/NumberOperator';
import { DataSourceProps } from '../../../../../src/data_sources/types';
import ConditionalComponentView from '../../../../../src/data_sources/view/ComponentDynamicView';
import ComponentWrapper from '../../../../../src/dom_components/model/ComponentWrapper';
import ComponentTableView from '../../../../../src/dom_components/view/ComponentTableView';
import ComponentTextView from '../../../../../src/dom_components/view/ComponentTextView';
import EditorModel from '../../../../../src/editor/model/Editor';
import { setupTestEditor } from '../../../../common';

describe('ComponentConditionalVariable', () => {
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

  it('should add a component with a condition that evaluates a component definition', () => {
    const component = cmpRoot.append({
      type: ConditionalVariableType,
      condition: {
        left: 0,
        operator: NumberOperation.greaterThan,
        right: -1,
      },
      ifTrue: {
        tagName: 'h1',
        type: 'text',
        content: 'some text',
      },
    })[0];
    expect(component).toBeDefined();
    expect(component.get('type')).toBe(ConditionalVariableType);
    expect(component.getInnerHTML()).toBe('<h1>some text</h1>');
    const componentView = component.getView();
    expect(componentView).toBeInstanceOf(ConditionalComponentView);
    expect(componentView?.el.textContent).toBe('some text');

    const childComponent = getFirstChild(component);
    const childView = getFirstChildView(component);
    expect(childComponent).toBeDefined();
    expect(childComponent.get('type')).toBe('text');
    expect(childComponent.getInnerHTML()).toBe('some text');
    expect(childView).toBeInstanceOf(ComponentTextView);
    expect(childView?.el.innerHTML).toBe('some text');
  });

  it('should add a component with a condition that evaluates a string', () => {
    const component = cmpRoot.append({
      type: ConditionalVariableType,
      condition: {
        left: 0,
        operator: NumberOperation.greaterThan,
        right: -1,
      },
      ifTrue: '<h1>some text</h1>',
    })[0];
    expect(component).toBeDefined();
    expect(component.get('type')).toBe(ConditionalVariableType);
    expect(component.getInnerHTML()).toBe('<h1>some text</h1>');
    const componentView = component.getView();
    expect(componentView).toBeInstanceOf(ConditionalComponentView);
    expect(componentView?.el.textContent).toBe('some text');

    const childComponent = getFirstChild(component);
    const childView = getFirstChildView(component);
    expect(childComponent).toBeDefined();
    expect(childComponent.get('type')).toBe('text');
    expect(childComponent.getInnerHTML()).toBe('some text');
    expect(childView).toBeInstanceOf(ComponentTextView);
    expect(childView?.el.innerHTML).toBe('some text');
  });

  it('should test component variable with data-source', () => {
    const dataSource: DataSourceProps = {
      id: 'ds1',
      records: [
        { id: 'left_id', left: 'Name1' },
        { id: 'right_id', right: 'Name1' },
      ],
    };
    dsm.add(dataSource);

    const component = cmpRoot.append({
      type: ConditionalVariableType,
      condition: {
        left: {
          type: DataVariableType,
          path: 'ds1.left_id.left',
        },
        operator: GenericOperation.equals,
        right: {
          type: DataVariableType,
          path: 'ds1.right_id.right',
        },
      },
      ifTrue: {
        tagName: 'h1',
        type: 'text',
        content: 'Some value',
      },
      ifFalse: {
        tagName: 'h1',
        type: 'text',
        content: 'False value',
      },
    })[0];

    const childComponent = getFirstChild(component);
    expect(childComponent).toBeDefined();
    expect(childComponent.get('type')).toBe('text');
    expect(childComponent.getInnerHTML()).toBe('Some value');

    /* Test changing datasources */
    updatedsmLeftValue(dsm, 'Diffirent value');
    expect(getFirstChild(component).getInnerHTML()).toBe('False value');
    expect(getFirstChildView(component)?.el.innerHTML).toBe('False value');
    updatedsmLeftValue(dsm, 'Name1');
    expect(getFirstChild(component).getInnerHTML()).toBe('Some value');
    expect(getFirstChildView(component)?.el.innerHTML).toBe('Some value');
  });

  it('should test a conditional component with a child that is also a conditional component', () => {
    const dataSource: DataSourceProps = {
      id: 'ds1',
      records: [
        { id: 'left_id', left: 'Name1' },
        { id: 'right_id', right: 'Name1' },
      ],
    };
    dsm.add(dataSource);

    const component = cmpRoot.append({
      type: ConditionalVariableType,
      condition: {
        left: {
          type: DataVariableType,
          path: 'ds1.left_id.left',
        },
        operator: GenericOperation.equals,
        right: {
          type: DataVariableType,
          path: 'ds1.right_id.right',
        },
      },
      ifTrue: {
        tagName: 'div',
        components: [
          {
            type: ConditionalVariableType,
            condition: {
              left: {
                type: DataVariableType,
                path: 'ds1.left_id.left',
              },
              operator: GenericOperation.equals,
              right: {
                type: DataVariableType,
                path: 'ds1.right_id.right',
              },
            },
            ifTrue: {
              tagName: 'table',
              type: 'table',
            },
          },
        ],
      },
    })[0];

    const innerComponent = getFirstChild(getFirstChild(component));
    const innerComponentView = getFirstChildView(innerComponent);
    const innerHTML = '<table><tbody><tr class="row"><td class="cell"></td></tr></tbody></table>';
    expect(innerComponent.getInnerHTML()).toBe(innerHTML);
    expect(innerComponentView).toBeInstanceOf(ComponentTableView);
    expect(innerComponentView?.el.tagName).toBe('TABLE');
  });

  it('should store conditional components', () => {
    const conditionalCmptDef = {
      type: ConditionalVariableType,
      condition: {
        left: 0,
        operator: NumberOperation.greaterThan,
        right: -1,
      },
      ifTrue: [
        {
          tagName: 'h1',
          type: 'text',
          content: 'some text',
        },
      ],
    };

    cmpRoot.append(conditionalCmptDef)[0];

    const projectData = editor.getProjectData();
    const page = projectData.pages[0];
    const frame = page.frames[0];
    const storageCmptDef = frame.component.components[0];
    expect(storageCmptDef).toEqual(conditionalCmptDef);
  });

  it('should throw an error if no condition is passed', () => {
    const conditionalCmptDef = {
      type: ConditionalVariableType,
      ifTrue: {
        tagName: 'h1',
        type: 'text',
        content: 'some text',
      },
    };

    expect(() => {
      cmpRoot.append(conditionalCmptDef);
    }).toThrow(MissingConditionError);
  });
});

function updatedsmLeftValue(dsm: DataSourceManager, newValue: string) {
  dsm.get('ds1').getRecord('left_id')?.set('left', newValue);
}

function getFirstChildView(component: Component) {
  return getFirstChild(component).getView();
}

function getFirstChild(component: Component) {
  return component.components().at(0);
}
