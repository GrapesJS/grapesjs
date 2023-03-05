import { hasWin } from '../../utils/mixins';
import IStorage, { ProjectData } from './IStorage';

export interface LocalStorageConfig {
  /**
   * Local key identifier of the project.
   * @default 'gjsProject'
   */
  key?: string;

  /**
   * If enabled, checks if browser supports LocalStorage.
   * @default true
   */
  checkLocal?: boolean;
}

export default class LocalStorage implements IStorage<LocalStorageConfig> {
  async store(data: ProjectData, opts: LocalStorageConfig = {}) {
    if (this.hasLocal(opts, true)) {
      localStorage.setItem(opts.key!, JSON.stringify(data));
    }
    return data;
  }

  async load(opts: LocalStorageConfig = {}) {
    let result = {};

    if (this.hasLocal(opts, true)) {
      result = JSON.parse(localStorage.getItem(opts.key!) || '{}');
    }

    return result;
  }

  hasLocal(opts: LocalStorageConfig = {}, thr?: boolean) {
    if (opts.checkLocal && (!hasWin() || !localStorage)) {
      if (thr) throw new Error('localStorage not available');
      return false;
    }

    return true;
  }
}
