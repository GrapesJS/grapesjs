import Asset from './Asset';

export default Asset.extend({
  defaults: {
    ...Asset.prototype.defaults,
    type: 'image',
    unitDim: 'px',
    srcset: '',
    height: 0,
    width: 0
  }
});
