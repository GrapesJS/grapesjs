import Component from '../../../dom_components/model/Component';
import { toLowerCase } from '../../../utils/mixins';
import { evaluateVariable, isDataVariable } from '../utils';
import { Condition } from './Condition';
import { DataCondition, DataConditionType } from './DataCondition';

export default class ComponentConditionalVariable extends Component {
  getDataValue(): any {
    const dataCondtion = this.getDataCondition();
    return dataCondtion.getDataValue();
  }

  getDependentDataVariables() {
    const dataCondtion = this.getDataCondition();
    return dataCondtion.getDependentDataVariables();
  }

  private getDataCondition() {
    const { condition, ifTrue, ifFalse, em } = this.attributes;
    const dataCondtion = new DataCondition(condition, ifTrue, ifFalse, { em });
    return dataCondtion;
  }

  getInnerHTML() {
    return this.getDataValue();
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataConditionType;
  }
}
