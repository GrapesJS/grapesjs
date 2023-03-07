import Asset from './Asset';

export default class AssetImage extends Asset {
  defaults() {
    return {
      ...Asset.getDefaults(),
      type: 'image',
      unitDim: 'px',
      height: 0,
      width: 0,
    };
  }
}
