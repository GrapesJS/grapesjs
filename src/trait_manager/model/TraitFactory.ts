import { TraitManagerConfig } from '../config/config';
import { isString } from 'underscore';
import Trait, { TraitProperties } from './Trait';

export default class TraitFactory {
  config: Partial<TraitManagerConfig>;

  constructor(config: Partial<TraitManagerConfig> = {}) {
    this.config = config;
  }

  /**
   * Build props object by their name
   */
  build(prop: string | TraitProperties): Trait {
    return isString(prop) ? this.buildFromString(prop) : new Trait(prop);
  }

  private buildFromString(name: string): Trait {
    const obj: TraitProperties = {
      name: name,
      type: 'text',
    };

    switch (name) {
      case 'target':
        obj.type = 'select';
        obj.default = false;
        obj.options = this.config.optionsTarget;
        break;
    }
    return new Trait(obj);
  }
}
