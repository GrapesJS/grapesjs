import Component from '../../../dom_components/model/Component';
import { toLowerCase } from '../../../utils/mixins';
import { evaluateVariable } from '../utils';
import { Condition } from './Condition';
import { DataConditionType } from './DataCondition';

export default class ComponentConditionalVariable extends Component {
  getDataValue(): any {
    const { condition: conditionAttribute, ifTrue, ifFalse, em } = this.attributes;
    const condition = new Condition(conditionAttribute, { em });
    return condition.evaluate() ? evaluateVariable(ifTrue, em) : evaluateVariable(ifFalse, em);
  }

  getInnerHTML() {
    return this.getDataValue();
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataConditionType;
  }
}
