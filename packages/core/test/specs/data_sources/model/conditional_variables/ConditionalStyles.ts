import { DataSourceManager, Editor } from '../../../../../src';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import {
  ConditionalVariableType,
  MissingConditionError,
} from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { GenericOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/GenericOperator';
import { NumberOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/NumberOperator';
import { DataSourceProps } from '../../../../../src/data_sources/types';
import ComponentWrapper from '../../../../../src/dom_components/model/ComponentWrapper';
import EditorModel from '../../../../../src/editor/model/Editor';
import { filterObjectForSnapshot, setupTestEditor } from '../../../../common';

describe('StyleConditionalVariable', () => {
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

  it('should add a component with a conditionally styled attribute', () => {
    const component = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      content: 'some text',
      style: {
        color: {
          type: ConditionalVariableType,
          condition: {
            left: 0,
            operator: NumberOperation.greaterThan,
            right: -1,
          },
          ifTrue: 'red',
          ifFalse: 'black',
        },
      },
    })[0];

    expect(component).toBeDefined();
    expect(component.getStyle().color).toBe('red');
  });

  it('should change style based on data source changes', () => {
    const dataSource: DataSourceProps = {
      id: 'ds1',
      records: [
        { id: 'left_id', left: 'Value1' },
        { id: 'right_id', right: 'Value2' },
      ],
    };
    dsm.add(dataSource);

    const component = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      content: 'some text',
      style: {
        color: {
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
          ifTrue: 'green',
          ifFalse: 'blue',
        },
      },
    })[0];

    expect(component.getStyle().color).toBe('blue');

    dsm.get('ds1').getRecord('right_id')?.set('right', 'Value1');
    expect(component.getStyle().color).toBe('green');
  });

  it('should throw an error if no condition is passed in style', () => {
    expect(() => {
      cmpRoot.append({
        tagName: 'h1',
        type: 'text',
        content: 'some text',
        style: {
          color: {
            type: ConditionalVariableType,
            ifTrue: 'grey',
            ifFalse: 'red',
          },
        },
      });
    }).toThrow(MissingConditionError);
  });

  it.skip('should store components with conditional styles correctly', () => {
    const conditionalStyleDef = {
      tagName: 'h1',
      type: 'text',
      content: 'some text',
      style: {
        color: {
          type: ConditionalVariableType,
          condition: {
            left: 0,
            operator: NumberOperation.greaterThan,
            right: -1,
          },
          ifTrue: 'yellow',
          ifFalse: 'black',
        },
      },
    };

    cmpRoot.append(conditionalStyleDef)[0];

    const projectData = filterObjectForSnapshot(editor.getProjectData());
    const page = projectData.pages[0];
    const frame = page.frames[0];
    const storedComponent = frame.component.components[0];
    expect(storedComponent).toEqual(expect.objectContaining(conditionalStyleDef));
  });
});
