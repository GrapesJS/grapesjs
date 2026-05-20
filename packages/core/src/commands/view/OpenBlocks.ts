import { isFunction } from 'underscore';
import { createEl } from '../../utils/dom';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface OpenBlocksCommandRegistryRun {
  'core:open-blocks': CommandPublicFnFromHandler<CommandOpenBlocks['run']>;
  'open-blocks': CommandPublicFnFromHandler<CommandOpenBlocks['run']>;
}

export interface OpenBlocksCommandRegistryStop {
  'core:open-blocks': CommandPublicFnFromHandler<CommandOpenBlocks['stop']>;
  'open-blocks': CommandPublicFnFromHandler<CommandOpenBlocks['stop']>;
}

export default class CommandOpenBlocks extends CommandAbstract {
  container?: HTMLElement;
  editor?: Editor;
  bm?: any;
  firstRender?: boolean;

  open() {
    const { container, editor, bm, config } = this;
    if (!container || !editor || !bm || !config) return;
    const { custom, appendTo } = config;

    if (isFunction(custom.open)) {
      return custom.open(bm.__customData());
    }

    if (this.firstRender && !appendTo) {
      const id = 'views-container';
      const pn = editor.Panels;
      const panels = pn.getPanel(id) || pn.addPanel({ id });
      panels.set('appendContent', container).trigger('change:appendContent');
      if (!custom) container.appendChild(bm.render());
    }

    container.style.display = 'block';
  }

  close() {
    const { container, config, bm } = this;
    if (!config || !bm) return;
    const { custom } = config;

    if (isFunction(custom.close)) {
      return custom.close(bm.__customData());
    }

    if (container) container.style.display = 'none';
  }

  run(editor: Editor) {
    const bm = editor.Blocks;
    this.config = bm.getConfig();
    this.firstRender = !this.container;
    this.container = this.container || createEl('div');
    this.editor = editor;
    this.bm = bm;
    const { container } = this;
    bm.__behaviour({
      container,
    });

    if (this.config.custom) {
      bm.__trgCustom();
    }

    this.open();
  }

  stop() {
    this.close();
  }
}
