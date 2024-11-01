import { DataSourceManager, Editor } from '../../../../../src';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import { MissingConditionError } from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { ConditionalVariableType } from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { GenericOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/GenericOperator';
import { NumberOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/NumberOperator';
import { DataSourceProps } from '../../../../../src/data_sources/types';
import { dynamicAttrKey } from '../../../../../src/dom_components/model/Component';
import ComponentWrapper from '../../../../../src/dom_components/model/ComponentWrapper';
import EditorModel from '../../../../../src/editor/model/Editor';
import { setupTestEditor } from '../../../../common';

describe('TraitConditionalVariable', () => {
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

  it('should add a trait with a condition evaluating to a string', () => {
    const component = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      traits: [
        {
          type: 'text',
          name: 'title',
          value: {
            type: ConditionalVariableType,
            condition: {
              left: 0,
              operator: NumberOperation.greaterThan,
              right: -1,
            },
            ifTrue: 'Some title',
          },
        },
      ],
    })[0];

    expect(component).toBeDefined();
    expect(component.getTrait('title').get('value')).toBe('Some title');
    expect(component.getAttributes().title).toBe('Some title');
  });

  it('should add a trait with a data-source condition', () => {
    const dataSource: DataSourceProps = {
      id: 'ds1',
      records: [{ id: 'left_id', left: 'Name1' }],
    };
    dsm.add(dataSource);

    const component = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      traits: [
        {
          type: 'text',
          name: 'title',
          value: {
            type: ConditionalVariableType,
            condition: {
              left: {
                type: DataVariableType,
                path: 'ds1.left_id.left',
              },
              operator: GenericOperation.equals,
              right: 'Name1',
            },
            ifTrue: 'Valid name',
            ifFalse: 'Invalid name',
          },
        },
      ],
    })[0];

    const traitValue = component.getTrait('title').get('value');
    expect(traitValue).toBe('Valid name');
    expect(component.getAttributes().title).toBe('Valid name');
  });

  it('should change trait value with changing data-source value', () => {
    const dataSource: DataSourceProps = {
      id: 'ds1',
      records: [{ id: 'left_id', left: 'Name1' }],
    };
    dsm.add(dataSource);

    const component = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      traits: [
        {
          type: 'text',
          name: 'title',
          value: {
            type: ConditionalVariableType,
            condition: {
              left: {
                type: DataVariableType,
                path: 'ds1.left_id.left',
              },
              operator: GenericOperation.equals,
              right: 'Name1',
            },
            ifTrue: 'Correct name',
            ifFalse: 'Incorrect name',
          },
        },
      ],
    })[0];

    const traitValueBefore = component.getTrait('title').get('value');
    expect(traitValueBefore).toBe('Correct name');
    const titleBefore = component.getAttributes().title;
    expect(titleBefore).toBe('Correct name');

    dsm.get('ds1').getRecord('left_id')?.set('left', 'Different name');
    const traitValueAfter = component.getTrait('title').get('value');
    expect(traitValueAfter).toBe('Incorrect name');
    const titleAfter = component.getAttributes().title;
    expect(titleAfter).toBe('Incorrect name');
  });

  it('should throw an error if no condition is passed in trait', () => {
    expect(() => {
      cmpRoot.append({
        tagName: 'h1',
        type: 'text',
        traits: [
          {
            type: 'text',
            name: 'invalidTrait',
            value: {
              type: ConditionalVariableType,
            },
          },
        ],
      });
    }).toThrow(MissingConditionError);
  });

  it('should store traits with conditional values correctly', () => {
    const conditionalTrait = {
      type: ConditionalVariableType,
      condition: {
        left: 0,
        operator: NumberOperation.greaterThan,
        right: -1,
      },
      ifTrue: 'Positive',
    };
    cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      traits: [
        {
          type: 'text',
          name: 'dynamicTrait',
          value: conditionalTrait,
        },
      ],
    })[0];

    const projectData = editor.getProjectData();
    const page = projectData.pages[0];
    const frame = page.frames[0];
    const storedComponent = frame.component.components[0];

    expect(storedComponent[dynamicAttrKey]).toEqual({
      dynamicTrait: conditionalTrait,
    });
  });

  it('should handle objects as traits (other than dynamic values)', () => {
    const traitValue = {
      type: 'UNKNOWN_TYPE',
      condition: "This's not a condition",
      value: 'random value',
    };

    const component = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      traits: [
        {
          type: 'text',
          name: 'title',
          value: traitValue,
        },
      ],
    })[0];
    expect(component.getTrait('title').get('value')).toEqual(traitValue);
    expect(component.getAttributes().title).toEqual(traitValue);
  });
});
