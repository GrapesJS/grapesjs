import Property from './PropertyInteger';

export default Property.extend({
  defaults: {
    ...Property.getDefaults(),
    showInput: 1,
  },
});
