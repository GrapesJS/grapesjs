import { TraitManagerConfig } from '../config/config';
import { TraitProperties } from './Trait';

export default (config: Partial<TraitManagerConfig> = {}) => ({
  /**
   * Build props object by their name
   * @param  {Array<string>|string} props Array of properties name
   * @return {Array<Object>}
   */
  build(props: string | string[]) {
    const objs = [];

    if (typeof props === 'string') props = [props];

    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const obj: TraitProperties = {
        name: prop,
        type: 'text',
      };

      switch (prop) {
        case 'target':
          obj.type = 'select';
          obj.default = false;
          obj.options = config.optionsTarget;
          break;
      }

      objs.push(obj);
    }

    return objs;
  },
});
