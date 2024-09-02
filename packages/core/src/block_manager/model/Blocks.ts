import { CollectionWithCategories } from '../../abstract/CollectionWithCategories';
import EditorModel from '../../editor/model/Editor';
import Block from './Block';

export default class Blocks extends CollectionWithCategories<Block> {
  em: EditorModel;

  constructor(coll: any[], options: { em: EditorModel }) {
    super(coll);
    this.em = options.em;
    this.on('add', this.handleAdd);
  }

  getCategories() {
    return this.em.Blocks.getCategories();
  }

  handleAdd(model: Block) {
    this.initCategory(model);
  }
}

Blocks.prototype.model = Block;
