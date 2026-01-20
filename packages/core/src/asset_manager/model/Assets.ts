import CollectionWithPatches from '../../patch_manager/CollectionWithPatches';
import Asset from './Asset';
import AssetImage from './AssetImage';
import AssetImageView from '../view/AssetImageView';
import TypeableCollection from '../../domain_abstract/model/TypeableCollection';

export class Assets extends CollectionWithPatches<Asset> {
  types: any[] | undefined;
  target?: any;
  onSelect?: any;
  getTypes!: () => any[];
  getType!: (id: string) => any;
  getBaseType!: () => any;
  recognizeType!: (value: any) => any;
  addType!: (id: string, definition: any) => void;

  constructor(models?: any, options?: any) {
    super(models, options);
  }
}

Object.assign(Assets.prototype, TypeableCollection);
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

export default Assets;
