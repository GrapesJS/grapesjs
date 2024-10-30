import Component from '../../../dom_components/model/Component';
import Components from '../../../dom_components/model/Components';
import { ComponentDefinition, ComponentOptions } from '../../../dom_components/model/types';
import { toLowerCase } from '../../../utils/mixins';
import { DataCondition, ConditionalVariableType, Expression, LogicGroup } from './DataCondition';

type ConditionalComponentDefinition = {
  condition: Expression | LogicGroup | boolean;
  ifTrue: any;
  ifFalse: any;
};

export default class ComponentConditionalVariable extends Component {
  dataCondition: DataCondition;
  componentDefinition: ConditionalComponentDefinition;

  constructor(componentDefinition: ConditionalComponentDefinition, opt: ComponentOptions) {
    const { condition, ifTrue, ifFalse } = componentDefinition;
    const dataConditionInstance = new DataCondition(condition, ifTrue, ifFalse, { em: opt.em });
    const initialComponentsProps = dataConditionInstance.getDataValue();
    const conditionalCmptDef = {
      type: ConditionalVariableType,
      components: initialComponentsProps,
    };
    super(conditionalCmptDef, opt);

    this.componentDefinition = componentDefinition;
    this.dataCondition = dataConditionInstance;
    this.dataCondition.onValueChange = this.handleConditionChange.bind(this);
    this.refreshComponentState();
  }

  private handleConditionChange() {
    this.dataCondition.reevaluate();
    const updatedComponents = this.dataCondition.getDataValue();
    if (updatedComponents instanceof Components) {
      const componentsArray = updatedComponents.map((cmp) => cmp);
      this.components().set(componentsArray);
    } else {
      this.components().reset();
      this.components().add(updatedComponents);
    }

    this.refreshComponentState();
  }

  private refreshComponentState() {
    if (this.dataCondition.lastEvaluationResult) {
      this.assignComponents({ positiveCaseComponents: this.components() });
    } else {
      this.assignComponents({ negativeCaseComponents: this.components() });
    }
  }

  private assignComponents({
    positiveCaseComponents,
    negativeCaseComponents,
  }: {
    positiveCaseComponents?: Components;
    negativeCaseComponents?: Components;
  }) {
    if (positiveCaseComponents) {
      this.dataCondition.ifTrue = positiveCaseComponents;
    }
    if (negativeCaseComponents) {
      this.dataCondition.ifFalse = negativeCaseComponents;
    }
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === ConditionalVariableType;
  }

  toJSON(): ComponentDefinition {
    return this.componentDefinition;
  }
}
