import Backbone from 'backbone';

export default Backbone.Model.extend({
  idAttribute: 'src',

  defaults: {
    type: '',
    src: ''
  },

  /**
   * Get filename of the asset
   * @return  {string}
   * @private
   * */
  getFilename() {
    return this.get('src')
      .split('/')
      .pop();
  },

  /**
   * Get extension of the asset
   * @return  {string}
   * @private
   * */
  getExtension() {
    return this.getFilename()
      .split('.')
      .pop();
  }
});
