const Asset = require('./Asset');

module.exports = Asset.extend({
  defaults: {
    ...Asset.prototype.defaults,
    type: 'image',
    unitDim: 'px',
    height: 0,
    width: 0
  },
});
