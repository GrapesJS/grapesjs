import { ItemManagerModule } from '../abstract/Module';
import { DataSources } from './model/DataSources';

export default class DataSourceManager extends ItemManagerModule<{}, DataSources> {
  storageKey = '';
  destroy(): void {}
}
