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
  }

  private handleConditionChange() {
    this.dataCondition.reevaluate();
    const updatedComponents = this.dataCondition.getDataValue();
    this.components().reset();
    this.components().add(updatedComponents);
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === ConditionalVariableType;
  }

  toJSON(): ComponentDefinition {
    return this.dataCondition.toJSON();
  }
}
