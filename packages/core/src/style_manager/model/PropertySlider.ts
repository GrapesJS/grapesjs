import PropertyNumber from './PropertyNumber';

export default class PropertySlider extends PropertyNumber {
  defaults() {
    return {
      ...PropertyNumber.getDefaults(),
      showInput: 1,
    };
  }
}
