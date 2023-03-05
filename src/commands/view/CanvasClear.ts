import { CommandObject } from './CommandAbstract';

export default {
  run(ed) {
    ed.DomComponents.clear();
    ed.CssComposer.clear();
  },
} as CommandObject;
