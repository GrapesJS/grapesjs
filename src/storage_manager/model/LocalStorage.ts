import { hasWin } from "../../utils/mixins";
import IStorage from "./IStorage";

interface LocalStorageConfig {
  key: string;
  checkLocal: boolean;
}

export default class LocalStorage implements IStorage {
  config: LocalStorageConfig;
  constructor(config: LocalStorageConfig) {
    this.config = config;
  }

  async store(data: any) {
    const { key } = this.config;
    if (this.hasLocal(true)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  async load() {
    const { key } = this.config;
    let result = {};

    if (this.hasLocal(true)) {
      result = JSON.parse(localStorage.getItem(key) || "{}");
    }

    return result;
  }

  hasLocal(thr: boolean) {
    const { checkLocal } = this.config;
    if (checkLocal && (!hasWin() || !localStorage)) {
      if (thr) throw new Error("localStorage not available");
      return false;
    }

    return true;
  }
}
