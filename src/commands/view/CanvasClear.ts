import { CommandObject } from './CommandAbstract';

export default {
  run(ed) {
    ed.Components.clear();
    ed.Css.clear();
  },
} as CommandObject;
