import { DataSourceListener } from '../types';
import { stringToPath } from '../../utils/mixins';
import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import DataVariable, { DataVariableType } from './DataVariable';
import { DataResolver } from '../types';
import DataRecord from './DataRecord';
import DataSource from './DataSource';
import {
  DataCondition,
  DataConditionOutputChangedEvent,
  DataConditionType,
} from './conditional_variables/DataCondition';

export interface DataResolverListenerProps {
  em: EditorModel;
  resolver: DataResolver;
  onUpdate: (value: any) => void;
}

interface ListenerWithCallback extends DataSourceListener {
  callback: (opts?: any) => void;
}

export default class DataResolverListener {
  private listeners: ListenerWithCallback[] = [];
  private em: EditorModel;
  private onUpdate: (value: any) => void;
  private model = new Model();
  resolver: DataResolver;

  constructor(props: DataResolverListenerProps) {
    this.em = props.em;
    this.resolver = props.resolver;
    this.onUpdate = props.onUpdate;
    this.listenToResolver();
  }

  private onChange = () => {
    const value = this.resolver.getDataValue();
    this.onUpdate(value);
  };

  private createListener(
    obj: any,
    event: string,
    callback: (opts?: any) => void = this.onChange,
  ): ListenerWithCallback {
    return { obj, event, callback };
  }

  listenToResolver() {
    const { resolver, model } = this;
    this.removeListeners();
    let listeners: ListenerWithCallback[] = [];
    const type = resolver.attributes.type;

    switch (type) {
      case DataVariableType:
        listeners = this.listenToDataVariable(resolver as DataVariable);
        break;
      case DataConditionType:
        listeners = this.listenToConditionalVariable(resolver as DataCondition);
        break;
    }

    listeners.forEach((ls) => model.listenTo(ls.obj, ls.event, ls.callback));
    this.listeners = listeners;
  }

  private listenToConditionalVariable(dataVariable: DataCondition): ListenerWithCallback[] {
    return [
      {
        obj: dataVariable,
        event: DataConditionOutputChangedEvent,
        callback: this.onChange,
      },
    ];
  }

  private listenToDataVariable(dataVariable: DataVariable): ListenerWithCallback[] {
    const { em } = this;
    const dataListeners: ListenerWithCallback[] = [];
    const onChangeAndRewatch = () => {
      this.listenToResolver();
      this.onChange();
    };
    dataListeners.push(this.createListener(dataVariable, 'change', onChangeAndRewatch));

    const path = dataVariable.getResolverPath();
    if (!path) return dataListeners;

    const dsAll = em.DataSources.all;
    const [dsId, drKey, ...propPathParts] = stringToPath(path || '');
    const [ds, dr] = em.DataSources.fromPath(path!);
    const isIndexPath = !!ds && drKey !== undefined && ds.isRecordIndex(drKey);
    const onMatchingSourceChange = (ds: DataSource) => ds.id === dsId && onChangeAndRewatch();

    dataListeners.push(
      this.createListener(dsAll, 'add remove', onMatchingSourceChange),
      this.createListener(dsAll, 'reset', onChangeAndRewatch),
    );

    if (!ds) return dataListeners;

    if (drKey === undefined) {
      dataListeners.push(this.createListener(ds.records, 'add remove reset change', onChangeAndRewatch));
      return dataListeners;
    }

    if (dr) {
      const onRecordChange = (record: DataRecord) => this.onRecordChange(record, propPathParts);
      dataListeners.push(this.createListener(dr, 'change', onRecordChange));
    }

    if (isIndexPath) {
      dataListeners.push(this.createListener(ds.records, 'add remove reset', onChangeAndRewatch));
      return dataListeners;
    }

    const onMatchingRecordChange = (record: DataRecord) => `${record.id}` === `${drKey}` && onChangeAndRewatch();
    dataListeners.push(
      this.createListener(ds.records, 'add remove', onMatchingRecordChange),
      this.createListener(ds.records, 'reset', onChangeAndRewatch),
    );

    return dataListeners;
  }

  private onRecordChange(record: DataRecord, propPath: string[]) {
    const changed = Object.keys(record.changedAttributes() || {});
    const [rootProp] = propPath;

    if (!changed.length || changed.includes('id') || !propPath.length || (rootProp && changed.includes(rootProp))) {
      this.onChange();
    }
  }

  private removeListeners() {
    this.listeners.forEach((ls) => this.model.stopListening(ls.obj, ls.event, ls.callback));
    this.listeners = [];
  }

  destroy() {
    this.removeListeners();
  }
}
