import { DataSourcesEvents } from '../../dataSources/types';
import ComponentDataVariable from '../model/ComponentDataVariable';
import ComponentView from './ComponentView';

export default class ComponentDataVariableView extends ComponentView<ComponentDataVariable> {
  initialize(opt = {}) {
    super.initialize(opt);
    const { model, em } = this;
    const { path } = model.attributes;
    this.listenTo(em, `${DataSourcesEvents.path}:${path}`, () => this.postRender());
  }

  postRender() {
    const { model, el, em } = this;
    const { path, value } = model.attributes;
    el.innerHTML = em.DataSources.getValue(path, value);
    super.postRender();
  }
}
