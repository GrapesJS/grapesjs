import Component from '../../../dom_components/model/Component';
import { ComponentOptions, ComponentProperties } from '../../../dom_components/model/types';
import { toLowerCase } from '../../../utils/mixins';
import { DataCondition, DataConditionType } from './DataCondition';

export default class ComponentConditionalVariable extends Component {
  dataCondition: DataCondition;

  constructor(props: ComponentProperties = {}, opt: ComponentOptions) {
    const { condition, ifTrue, ifFalse } = props;
    const dataCondtion = new DataCondition(condition, ifTrue, ifFalse, { em: opt.em });
    const componentProperties = dataCondtion.getDataValue();

    super(componentProperties, opt);
    this.dataCondition = dataCondtion;
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataConditionType;
  }
}
