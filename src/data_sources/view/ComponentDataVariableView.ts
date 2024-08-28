import { DataSourcesEvents, DataVariableListener } from '../../data_sources/types';
import ComponentView from '../../dom_components/view/ComponentView';
import { stringToPath } from '../../utils/mixins';
import ComponentDataVariable from '../model/ComponentDataVariable';

export default class ComponentDataVariableView extends ComponentView<ComponentDataVariable> {
  dataListeners: DataVariableListener[] = [];

  initialize(opt = {}) {
    super.initialize(opt);
    this.listenToData();
    this.listenTo(this.model, 'change:path', this.listenToData);
  }

  listenToData() {
    const { model, em } = this;
    const { path } = model.attributes;
    const normPath = stringToPath(path || '').join('.');
    const { DataSources } = em;
    const [ds, dr] = DataSources.fromPath(path);
    const dataListeners: DataVariableListener[] = [];
    const prevListeners = this.dataListeners || [];

    prevListeners.forEach((ls) => this.stopListening(ls.obj, ls.event, this.postRender));

    ds && dataListeners.push({ obj: ds.records, event: 'add remove reset' });
    dr && dataListeners.push({ obj: dr, event: 'change' });
    dataListeners.push(
      { obj: model, event: 'change:path change:value' },
      { obj: DataSources.all, event: 'add remove reset' },
      { obj: em, event: `${DataSourcesEvents.path}:${normPath}` },
    );

    dataListeners.forEach((ls) => this.listenTo(ls.obj, ls.event, this.postRender));
    this.dataListeners = dataListeners;
  }

  postRender() {
    const { model, el, em } = this;
    const { path, value } = model.attributes;
    el.innerHTML = em.DataSources.getValue(path, value);
    super.postRender();
  }
}
