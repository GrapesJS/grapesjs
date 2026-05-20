import { $ } from '../../common';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface OpenStyleManagerCommandRegistryRun {
  'core:open-styles': CommandPublicFnFromHandler<CommandOpenStyleManager['run']>;
  'open-sm': CommandPublicFnFromHandler<CommandOpenStyleManager['run']>;
}

export interface OpenStyleManagerCommandRegistryStop {
  'core:open-styles': CommandPublicFnFromHandler<CommandOpenStyleManager['stop']>;
  'open-sm': CommandPublicFnFromHandler<CommandOpenStyleManager['stop']>;
}

export default class CommandOpenStyleManager extends CommandAbstract {
  sender?: any;
  sm?: any;
  $cnt?: any;
  $cntInner?: any;
  $header?: any;

  run(editor: Editor, sender: any) {
    this.sender = sender;

    if (!this.$cnt) {
      const config = editor.getConfig();
      const { Panels, DeviceManager, SelectorManager, StyleManager } = editor;
      const trgEvCnt = 'change:appendContent';
      const $cnt = $('<div></div>');
      const $cntInner = $('<div></div>');
      const $cntSlm = $('<div></div>');
      const $cntSm = $('<div></div>');
      this.$cnt = $cnt;
      this.$cntInner = $cntInner;
      $cntInner.append($cntSlm);
      $cntInner.append($cntSm);
      $cnt.append($cntInner);

      if (DeviceManager && config.showDevices) {
        const devicePanel = Panels.addPanel({ id: 'devices-c' });
        const dvEl = DeviceManager.render();
        devicePanel.set('appendContent', dvEl).trigger(trgEvCnt);
      }

      const slmConfig = SelectorManager.getConfig();
      if (slmConfig.custom) {
        SelectorManager.__trgCustom({ container: $cntSlm.get(0) });
      } else if (!slmConfig.appendTo) {
        $cntSlm.append(SelectorManager.render([]));
      }

      this.sm = StyleManager;
      const smConfig = StyleManager.getConfig();
      const pfx = smConfig.stylePrefix;
      this.$header = $(`<div class="${pfx}header">${editor.t('styleManager.empty')}</div>`);
      $cnt.append(this.$header);

      if (smConfig.custom) {
        StyleManager.__trgCustom({ container: $cntSm.get(0) });
      } else if (!smConfig.appendTo) {
        $cntSm.append(StyleManager.render());
      }

      const pnCnt = 'views-container';
      const pnl = Panels.getPanel(pnCnt) || Panels.addPanel({ id: pnCnt });
      pnl.set('appendContent', $cnt).trigger(trgEvCnt);

      const em = editor.getModel();
      this.listenTo(em, StyleManager.events.target, this.toggleSm);
    }

    this.toggleSm();
  }

  /**
   * Toggle Style Manager visibility
   * @private
   */
  toggleSm() {
    const { sender, sm, $cntInner, $header } = this;
    if ((sender && sender.get && !sender.get('active')) || !sm) return;

    if (sm.getSelected()) {
      $cntInner?.show();
      $header?.hide();
    } else {
      $cntInner?.hide();
      $header?.show();
    }
  }

  stop() {
    this.$cntInner?.hide();
    this.$header?.hide();
  }
}
