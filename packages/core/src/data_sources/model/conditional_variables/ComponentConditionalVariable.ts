import { Model, ObjectAny } from '../../../common';
import Component from '../../../dom_components/model/Component';
import { ComponentDefinition, ComponentOptions, ComponentProperties } from '../../../dom_components/model/types';
import { toLowerCase } from '../../../utils/mixins';
import { DataCondition, DataConditionType, Expression, LogicGroup } from './DataCondition';

type ConditionalComponentDefinition = {
  condition?: Expression | LogicGroup | boolean;
  ifTrue: any;
  ifFalse: any;
};
export class MissingConditionError extends Error {
  constructor() {
    super('No condition was provided to a conditional component.');
  }
}

export default class ComponentConditionalVariable extends Component {
  dataCondition: DataCondition;
  componentDefinition: ConditionalComponentDefinition;

  constructor(componentDefinition: ConditionalComponentDefinition, opt: ComponentOptions) {
    if (!componentDefinition.condition) {
      throw new MissingConditionError;
    }

    const { condition, ifTrue, ifFalse } = componentDefinition;
    const dataCondtion = new DataCondition(condition, ifTrue, ifFalse, { em: opt.em });
    const props = dataCondtion.getDataValue();

    super(props, opt);
    this.componentDefinition = componentDefinition;
    this.dataCondition = dataCondtion;
    this.dataCondition.onValueChange = this.onValueChange.bind(this);
  }

  private onValueChange() {
    this.dataCondition.reevaluate();
    const componentProperties = this.dataCondition.getDataValue();
    this.set(componentProperties);
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataConditionType;
  }
}
