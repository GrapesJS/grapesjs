import { DataSourcesEvents, DataVariableListener } from '../types';
import { stringToPath } from '../../utils/mixins';
import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import DataVariable from './DataVariable';
import ComponentView from '../../dom_components/view/ComponentView';
import ComponentDataVariable from './ComponentDataVariable';

export interface DataVariableListenerManagerOptions {
  model: Model | ComponentView;
  em: EditorModel;
  dataVariable: DataVariable | ComponentDataVariable;
  updateValueFromDataVariable: (value: any) => void;
}

export default class DataVariableListenerManager {
  private dataListeners: DataVariableListener[] = [];
  private em: EditorModel;
  private model: Model | ComponentView;
  private dataVariable: DataVariable | ComponentDataVariable;
  private updateValueFromDataVariable: (value: any) => void;

  constructor(options: DataVariableListenerManagerOptions) {
    this.em = options.em;
    this.model = options.model;
    this.dataVariable = options.dataVariable;
    this.updateValueFromDataVariable = options.updateValueFromDataVariable;

    this.listenToDataVariable();
  }

  listenToDataVariable() {
    const { em, dataVariable, model, updateValueFromDataVariable } = this;
    const { path } = dataVariable.attributes;
    const normPath = stringToPath(path || '').join('.');
    const prevListeners = this.dataListeners || [];
    const [ds, dr] = this.em.DataSources.fromPath(path);

    prevListeners.forEach((ls) => model.stopListening(ls.obj, ls.event, updateValueFromDataVariable));

    const dataListeners: DataVariableListener[] = [];
    ds && dataListeners.push({ obj: ds.records, event: 'add remove reset' });
    dr && dataListeners.push({ obj: dr, event: 'change' });
    dataListeners.push(
      { obj: dataVariable, event: 'change:path change:defaultValue' },
      { obj: em.DataSources.all, event: 'add remove reset' },
      { obj: em, event: `${DataSourcesEvents.path}:${normPath}` },
    );

    dataListeners.forEach((ls) =>
      model.listenTo(ls.obj, ls.event, () => {
        const value = dataVariable.getDataValue();

        updateValueFromDataVariable(value);
      }),
    );

    this.dataListeners = dataListeners;
  }
}
