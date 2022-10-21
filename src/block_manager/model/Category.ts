import { Model } from '../../common';

export interface BlockCategoryProperties {
  /**
   * Category id.
   */
  id: string;
  /**
   * Category label.
   */
  label: string;
  /**
   * Category open state.
   * @default true
   */
  open?: boolean;
  /**
   * Category attributes.
   * @default {}
   */
  attributes?: Record<string, any>;
}

export default class Category extends Model<BlockCategoryProperties> {
  defaults() {
    return {
      id: '',
      label: '',
      open: true,
      attributes: {},
    };
  }
}
