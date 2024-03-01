import { DataSourcesEvents } from '../../dataSources/types';
import { stringToPath } from '../../utils/mixins';
import ComponentDataVariable from '../model/ComponentDataVariable';
import ComponentView from './ComponentView';

export default class ComponentDataVariableView extends ComponentView<ComponentDataVariable> {
  initialize(opt = {}) {
    super.initialize(opt);
    this.listenToData();
  }

  listenToData() {
    const { model, em } = this;
    const { path } = model.attributes;
    const normPath = stringToPath(path || '').join('.');
    const { DataSources } = em;
    const [ds, dr] = DataSources.fromPath(path);

    if (ds) {
      this.listenTo(ds.records, 'add remove reset', this.postRender);
      this.listenTo(ds.records, 'add remove reset', this.postRender);
      dr && this.listenTo(dr, 'change', this.postRender);
    }

    this.listenTo(DataSources.all, 'add remove reset', this.postRender);
    this.listenTo(em, `${DataSourcesEvents.path}:${normPath}`, this.postRender);
    this.listenTo(model, 'change:path change:value', this.postRender);
  }

  postRender() {
    const { model, el, em } = this;
    const { path, value } = model.attributes;
    el.innerHTML = em.DataSources.getValue(path, value);
    super.postRender();
  }
}
