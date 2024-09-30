import Dragger from './Dragger';
import Resizer from './Resizer';
import * as mixins from './mixins';
import { Module } from '../abstract';
import EditorModel from '../editor/model/Editor';
import ComponentSorter from './sorter/ComponentSorter';
import StyleManagerSorter from './sorter/StyleManagerSorter';

export default class UtilsModule extends Module {
  Sorter = ComponentSorter;
  Resizer = Resizer;
  Dragger = Dragger;
  ComponentSorter = ComponentSorter;
  StyleManagerSorter = StyleManagerSorter;
  helpers = { ...mixins };

  constructor(em: EditorModel) {
    super(em, 'Utils');
  }

  destroy() {}
}
