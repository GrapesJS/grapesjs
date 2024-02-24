import ComponentDataVariable from '../model/ComponentDataVariable';
import ComponentView from './ComponentView';

export default class ComponentDataVariableView extends ComponentView<ComponentDataVariable> {
  initialize(opt = {}) {
    super.initialize(opt);
    const { model, em } = this;
    this.listenTo(em, model.attributes.path, () => this.postRender());
  }

  postRender() {
    const { model, el, em } = this;
    const { path, value } = model.attributes;
    el.innerHTML = em.DataSources.getValue(path, value);
    super.postRender();
  }
}
