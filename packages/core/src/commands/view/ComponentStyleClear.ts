import { flatten } from 'underscore';
import type CssRule from '../../css_composer/model/CssRule';
import type Component from '../../dom_components/model/Component';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface ComponentStyleClearRunOptions {
  target: Component;
}

export interface ComponentStyleClearCommandRegistryRun {
  'core:component-style-clear': CommandPublicFnFromHandler<CommandComponentStyleClear['run']>;
}

export default class CommandComponentStyleClear extends CommandAbstract<ComponentStyleClearRunOptions> {
  run(ed: Editor, s: any, opts: ComponentStyleClearRunOptions) {
    const { target } = opts;
    let toRemove: CssRule[] = [];

    if (!target.get('styles')) return toRemove;

    // Find all components in the project, of the target component type
    const type = target.get('type')!;
    const wrappers = ed.Pages.getAllWrappers();
    const len = flatten(wrappers.map((wrp) => wrp.findType(type))).length;

    // Remove component related styles only if there are no more components
    // of that type in the project
    if (!len) {
      const rules = ed.CssComposer.getAll();
      toRemove = rules.filter((rule) => rule.get('group') === `cmp:${type}`);
      rules.remove(toRemove);
    }

    return toRemove;
  }
}
