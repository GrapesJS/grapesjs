import { DataSourceManager, Editor } from '../../../../../src';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import { MissingConditionError } from '../../../../../src/data_sources/model/conditional_variables/ComponentConditionalVariable';
import { DataConditionType } from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { GenericOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/GenericOperator';
import { NumberOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/NumberOperator';
import { DataSourceProps } from '../../../../../src/data_sources/types';
import ComponentWrapper from '../../../../../src/dom_components/model/ComponentWrapper';
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
      type: DataConditionType,
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
    expect(component.get('type')).toBe('text');
    expect(component.getInnerHTML()).toBe('some text');
  });

  // TODO
  it.skip('should add a component with a condition that evaluates a string', () => {
    const component = cmpRoot.append({
      type: DataConditionType,
      condition: {
        left: 0,
        operator: NumberOperation.greaterThan,
        right: -1,
      },
      ifTrue: '<div>some text</div>',
    })[0];

    expect(component).toBeDefined();
    expect(component.get('type')).toBe('text');
    expect(component.getInnerHTML()).toBe('some text');
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
      type: DataConditionType,
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
    })[0];

    expect(component).toBeDefined();
    expect(component.get('type')).toBe('text');
    expect(component.getInnerHTML()).toBe('Some value');
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
      type: DataConditionType,
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
        components: [
          {
            type: DataConditionType,
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
              content: 'Some child value',
            },
          },
        ],
      },
    })[0];
    const childComponent = component.components().at(0);

    expect(component).toBeDefined();
    expect(component.get('type')).toBe('text');
    expect(component.getInnerHTML()).toBe('<h1>Some child value</h1>');
    expect(childComponent).toBeDefined();
    expect(childComponent.get('type')).toBe('text');
    expect(childComponent.getInnerHTML()).toBe('Some child value');
  });

  it('should test component variable with changing value of data-source', () => {
    const dataSource: DataSourceProps = {
      id: 'ds1',
      records: [
        { id: 'left_id', left: 'Name1' },
        { id: 'right_id', right: 'Name1' },
      ],
    };
    dsm.add(dataSource);

    const component = cmpRoot.append({
      type: DataConditionType,
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
        content: 'True value',
      },
      ifFalse: {
        tagName: 'h1',
        type: 'text',
        content: 'False value',
      },
    })[0];
    dsm.get('ds1').getRecord('left_id')?.set('left', 'Diffirent value');

    expect(component).toBeDefined();
    expect(component.get('type')).toBe('text');
    expect(component.getInnerHTML()).toBe('False value');
  });

  it('should test storage for conditional components', () => {
    const conditionalCmptDef = {
      type: DataConditionType,
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
      type: DataConditionType,
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
