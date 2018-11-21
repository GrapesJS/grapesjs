import Property from './PropertyRadio';

export default Property.extend({
  defaults: () => ({
    ...Property.prototype.defaults,
    full: 0
  })
});
