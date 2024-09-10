import Dragger from './Dragger';
import Sorter from './Sorter';
import Resizer from './Resizer';
import * as mixins from './mixins';
import { Module } from '../abstract';
import EditorModel from '../editor/model/Editor';

export default class UtilsModule extends Module {
  Sorter = Sorter;
  Resizer = Resizer;
  Dragger = Dragger;
  helpers = { ...mixins };

  constructor(em: EditorModel) {
    super(em, 'Utils');
  }

  destroy() {}
}
