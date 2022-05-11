import Trait from "./Trait";

export default class TraitFactory {
  config: any
  constructor(config = {}){
    this.config = config;
  }
  /**
   * Build props object by their name
   */
  build(props: string| string[]) {
    const objs = [];

    if (typeof props === 'string') props = [props];

    for (let i = 0; i < props.length; i++) {
      const obj: any = {};
      const prop = props[i];
      obj.name = prop;

      switch (prop) {
        case 'target':
          obj.type = 'select';
          obj.default = false;
          obj.options = this.config.optionsTarget;
          break;
      }

      objs.push(new Trait(obj));
    }

    return objs;
  }
};
