import Property from './PropertyNumber';

export default Property.extend({
  defaults: {
    ...Property.getDefaults(),
    showInput: 1,
  },
});
