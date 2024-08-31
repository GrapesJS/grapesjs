import ComponentView from '../../dom_components/view/ComponentView';
import ComponentDataVariable from '../model/ComponentDataVariable';
import DataVariableListenerManager from '../model/DataVariableListenerManager';

export default class ComponentDataVariableView extends ComponentView<ComponentDataVariable> {
  dataVariableListener?: DataVariableListenerManager;

  initialize(opt = {}) {
    super.initialize(opt);
    this.dataVariableListener = new DataVariableListenerManager({
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
