import { ItemManagerModule } from '../abstract/Module';
import { ObjectAny } from '../common';
import EditorModel from '../editor/model/Editor';
import { get } from '../utils/mixins';
import { DataSources } from './model/DataSources';
import { DataSourcesEvents } from './types';

export default class DataSourceManager extends ItemManagerModule<{}, DataSources> {
  storageKey = '';
  destroy(): void {}

  constructor(em: EditorModel) {
    super(em, 'DataSources', new DataSources([], em), DataSourcesEvents);
  }

  getValue(key: string | string[], defValue: any) {
    const context = this.all.reduce((acc, ds) => {
      acc[ds.id] = ds.records.reduce((accR, dr, i) => {
        accR[dr.id || i] = dr.attributes;
        return accR;
      }, {} as ObjectAny);
      return acc;
    }, {} as ObjectAny);
    console.log('getValue', { context });
    return get(context, key, defValue);
  }
}
