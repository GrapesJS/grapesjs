import { Model } from '../../common';

export default class Category extends Model {
  defaults() {
    return {
      id: '',
      label: '',
      open: true,
      attributes: {},
    };
  }
}
