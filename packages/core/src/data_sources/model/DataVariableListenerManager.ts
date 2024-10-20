import { DataSourcesEvents, DataVariableListener } from '../types';
import { stringToPath } from '../../utils/mixins';
import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import DataVariable, { DataVariableType } from './DataVariable';
import ComponentView from '../../dom_components/view/ComponentView';
import ComponentDataVariable from './ComponentDataVariable';

export interface DynamicVariableListenerManagerOptions {
  model: Model | ComponentView;
  em: EditorModel;
  dataVariable: DataVariable | ComponentDataVariable;
  updateValueFromDataVariable: (value: any) => void;
}

export default class DynamicVariableListenerManager {
  private dataListeners: DataVariableListener[] = [];
  private em: EditorModel;
  private model: Model | ComponentView;
  private dynamicVariable: DataVariable | ComponentDataVariable;
  private updateValueFromDynamicVariable: (value: any) => void;

  constructor(options: DynamicVariableListenerManagerOptions) {
    this.em = options.em;
    this.model = options.model;
    this.dynamicVariable = options.dataVariable;
    this.updateValueFromDynamicVariable = options.updateValueFromDataVariable;

    this.listenToDynamicVariable();
  }

  private onChange = () => {
    const value = this.dynamicVariable.getDataValue();
    this.updateValueFromDynamicVariable(value);
  };

  listenToDynamicVariable() {
    const { em, dynamicVariable, model } = this;
    this.removeListeners();

    const type = dynamicVariable.get('type');
    let dataListeners: DataVariableListener[] = [];
    switch (type) {
      case DataVariableType:
        dataListeners = this.listenToDataVariable(dynamicVariable, em);
        break;
    }
    dataListeners.forEach((ls) => model.listenTo(ls.obj, ls.event, this.onChange));

    this.dataListeners = dataListeners;
  }

  private listenToDataVariable(dataVariable: DataVariable | ComponentDataVariable, em: EditorModel) {
    const dataListeners: DataVariableListener[] = [];
    const { path } = dataVariable.attributes;
    const normPath = stringToPath(path || '').join('.');
    const [ds, dr] = this.em.DataSources.fromPath(path);
    ds && dataListeners.push({ obj: ds.records, event: 'add remove reset' });
    dr && dataListeners.push({ obj: dr, event: 'change' });
    dataListeners.push(
      { obj: dataVariable, event: 'change:path change:defaultValue' },
      { obj: em.DataSources.all, event: 'add remove reset' },
      { obj: em, event: `${DataSourcesEvents.path}:${normPath}` },
    );

    return dataListeners;
  }

  private removeListeners() {
    const { model } = this;
    this.dataListeners.forEach((ls) => model.stopListening(ls.obj, ls.event, this.onChange));
    this.dataListeners = [];
  }
}
