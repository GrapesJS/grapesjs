import PropertySelect from './PropertySelect';

export default class PropertyRadio extends PropertySelect {
  defaults() {
    return {
      ...PropertySelect.getDefaults(),
      full: 1,
    };
  }
}
