import CollectionWithPatches from '../../patch_manager/CollectionWithPatches';
import Asset from './Asset';
import AssetImage from './AssetImage';
import AssetImageView from '../view/AssetImageView';
import TypeableCollection from '../../domain_abstract/model/TypeableCollection';

const TypeableCollectionExt = CollectionWithPatches.extend(TypeableCollection);

export default class Assets extends TypeableCollectionExt<Asset> {}

Assets.prototype.types = [
  {
    id: 'image',
    model: AssetImage,
    view: AssetImageView,
    isType(value: string) {
      if (typeof value == 'string') {
        return {
          type: 'image',
          src: value,
        };
      }
      return value;
    },
  },
];
