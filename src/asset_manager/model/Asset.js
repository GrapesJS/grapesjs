import Backbone from 'backbone';

export default class Asset extends Backbone.Model {
    /**
     * Get filename of the asset
     * @return  {string}
     * @private
     */
    getFilename() {
        return this.get('src')
        .split('/')
        .pop();
    }

    /**
     * Get extension of the asset
     * @return  {string}
     * @private
     */
    getExtension() {
        return this.getFilename()
        .split('.')
        .pop();
    }
}
Asset.prototype.idAttribute = 'src';
Asset.prototype.defaults = {
    type: '',
    src: ''
  };
