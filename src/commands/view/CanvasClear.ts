import { CustomCommand } from './CommandAbstract';

export default {
  run(ed) {
    ed.DomComponents.clear();
    ed.CssComposer.clear();
  },
} as CustomCommand;
