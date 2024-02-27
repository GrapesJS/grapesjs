import { ItemManagerModule, ModuleConfig } from '../abstract/Module';
import { AddOptions, ObjectAny } from '../common';
import EditorModel from '../editor/model/Editor';
import { get } from '../utils/mixins';
import { DataSources } from './model/DataSources';
import { DataSourceProps, DataSourcesEvents } from './types';

export default class DataSourceManager extends ItemManagerModule<ModuleConfig, DataSources> {
  storageKey = '';
  destroy(): void {}

  constructor(em: EditorModel) {
    super(em, 'DataSources', new DataSources([], em), DataSourcesEvents);
  }

  getValue(key: string | string[], defValue: any) {
    const context = this.all.reduce((acc, ds) => {
      acc[ds.id] = ds.records.reduce((accR, dr, i) => {
        accR[i] = dr.attributes;
        accR[dr.id || i] = dr.attributes;
        return accR;
      }, {} as ObjectAny);
      return acc;
    }, {} as ObjectAny);
    return get(context, key, defValue);
  }

  add(props: DataSourceProps, opts: AddOptions = {}) {
    const { all } = this;
    props.id = props.id || this._createId();
    return all.add(props, opts);
  }

  get(id: string) {
    return this.all.add(id);
  }
}
