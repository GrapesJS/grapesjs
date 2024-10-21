import ComponentView from '../../dom_components/view/ComponentView';
import ComponentDataVariable from '../model/ComponentDataVariable';
import DynamicVariableListenerManager from '../model/DataVariableListenerManager';

export default class ComponentDataVariableView extends ComponentView<ComponentDataVariable> {
  dynamicVariableListener?: DynamicVariableListenerManager;

  initialize(opt = {}) {
    super.initialize(opt);
    this.dynamicVariableListener = new DynamicVariableListenerManager({
      model: this,
      em: this.em!,
      dataVariable: this.model,
      updateValueFromDataVariable: () => this.postRender(),
    });
  }

  postRender() {
    const { model, el, em } = this;
    const { path, defaultValue } = model.attributes;
    el.innerHTML = em.DataSources.getValue(path, defaultValue);
    super.postRender();
  }
}
