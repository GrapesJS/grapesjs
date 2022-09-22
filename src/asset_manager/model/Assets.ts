import { Collection } from '../../common';
import Asset from './Asset';
import AssetImage from './AssetImage';
import AssetImageView from './../view/AssetImageView';
import TypeableCollection from '../../domain_abstract/model/TypeableCollection';

const TypeableCollectionExt = Collection.extend(TypeableCollection);

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
