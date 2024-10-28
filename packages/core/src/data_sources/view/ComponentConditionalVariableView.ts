import ComponentView from '../../dom_components/view/ComponentView';
import ComponentConditionalVariable from '../model/conditional_variables/ComponentConditionalVariable';

export default class ComponentComponentVariableView extends ComponentView<ComponentConditionalVariable> {
  postRender() {
    const { model, el } = this;
    el.innerHTML = model.getDataValue();
    super.postRender();
  }
}
