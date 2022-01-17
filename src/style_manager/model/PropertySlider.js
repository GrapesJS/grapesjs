import Property from './PropertyNumber';

export default class PropertySlider extends Property {
  defaults() {
    return {
      ...Property.getDefaults(),
      showInput: 1,
    };
  }
}
