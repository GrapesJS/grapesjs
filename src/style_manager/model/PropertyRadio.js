import Property from './Property';

export default Property.extend({
  defaults: () => ({
    ...Property.prototype.defaults,
    // Array of options, eg. [{name: 'Label ', value: '100'}]
    options: [],
    full: 1
  }),

  initialize(...args) {
    Property.prototype.initialize.apply(this, args);
    this.listenTo(this, 'change:options', this.onOptionChange);
  },

  onOptionChange() {
    this.set('list', this.get('options'));
  },

  getOptions() {
    const { options, list } = this.attributes;
    return options && options.length ? options : list;
  },

  setOptions(opts = []) {
    this.set('options', opts);
    return this;
  },

  addOption(opt) {
    if (opt) {
      const opts = this.getOptions();
      this.setOptions([...opts, opt]);
    }
    return this;
  }
});
