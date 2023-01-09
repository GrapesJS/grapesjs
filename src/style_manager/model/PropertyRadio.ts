import Property from './PropertySelect';

export default class PropertyRadio extends Property {
  defaults() {
    return {
      ...Property.getDefaults(),
      full: 1,
    };
  }
}
