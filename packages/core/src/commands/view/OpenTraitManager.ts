import { $ } from '../../common';
import { ComponentsEvents } from '../../dom_components/types';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface OpenTraitManagerCommandRegistryRun {
  'core:open-traits': CommandPublicFnFromHandler<CommandOpenTraitManager['run']>;
  'open-tm': CommandPublicFnFromHandler<CommandOpenTraitManager['run']>;
}

export interface OpenTraitManagerCommandRegistryStop {
  'core:open-traits': CommandPublicFnFromHandler<CommandOpenTraitManager['stop']>;
  'open-tm': CommandPublicFnFromHandler<CommandOpenTraitManager['stop']>;
}

export default class CommandOpenTraitManager extends CommandAbstract {
  sender?: any;
  target?: any;
  $cn?: any;
  $cn2?: any;
  $header?: any;

  run(editor: Editor, sender: any) {
    this.sender = sender;
    const em = editor.getModel();
    const config = editor.Config;
    const pfx = config.stylePrefix;
    const tm = editor.TraitManager;
    const confTm = tm.getConfig();

    if (confTm.appendTo) return;

    if (!this.$cn) {
      const $cn = $('<div></div>');
      const $cn2 = $('<div></div>');
      this.$cn = $cn;
      this.$cn2 = $cn2;
      $cn.append($cn2);
      this.$header = $('<div>').append(`<div class="${confTm.stylePrefix}header">${em.t('traitManager.empty')}</div>`);
      $cn.append(this.$header);

      if (confTm.custom) {
        tm.__trgCustom({ container: $cn2.get(0) });
      } else {
        $cn2.append(`<div class="${pfx}traits-label">${em.t('traitManager.label')}</div>`);
        $cn2.append(tm.render());
      }

      const panels = editor.Panels;
      const panel = panels.getPanel('views-container') || panels.addPanel({ id: 'views-container' });
      panel?.set('appendContent', $cn.get(0)).trigger('change:appendContent');

      this.target = em;
      this.listenTo(this.target, ComponentsEvents.toggled, this.toggleTm);
    }

    this.toggleTm();
  }

  /**
   * Toggle Trait Manager visibility
   * @private
   */
  toggleTm() {
    const { sender, target, $cn2, $header } = this;
    if ((sender && sender.get && !sender.get('active')) || !target) return;

    if (target.getSelectedAll().length === 1) {
      $cn2?.show();
      $header?.hide();
    } else {
      $cn2?.hide();
      $header?.show();
    }
  }

  stop() {
    this.$cn2?.hide();
    this.$header?.hide();
  }
}
