import { View, $ } from '../../common';
import { getHostName } from '../../utils/host-name';
import { appendStyles } from '../../utils/mixins';
import EditorModel from '../model/Editor';

export default class EditorView extends View<EditorModel> {
  constructor(model: EditorModel) {
    super({ model });
    const { Panels, UndoManager } = model;
    model.view = this;
    model.once('change:ready', () => {
      Panels.active();
      Panels.disableButtons();
      UndoManager.clear();

      if (model.getConfig().telemetry) {
        this.sendTelemetryData().catch(() => {
          // Telemetry data silent fail
        });
      }

      setTimeout(() => {
        model.trigger('load', model.Editor);
        model.clearDirtyCount();
      });
    });
  }

  render() {
    const { $el, model } = this;
    const { Panels, Canvas, config, modules } = model;
    const pfx = config.stylePrefix;
    const classNames = [`${pfx}editor`];
    !config.customUI && classNames.push(`${pfx}one-bg ${pfx}two-color`);

    const contEl = $(config.el || `body ${config.container}`);
    config.cssIcons && appendStyles(config.cssIcons, { unique: true, prepand: true });
    $el.empty();

    config.width && contEl.css('width', config.width);
    config.height && contEl.css('height', config.height);

    $el.append(Canvas.render());
    $el.append(Panels.render());

    // Load shallow editor
    const { shallow } = model;
    const shallowCanvasEl = shallow.Canvas.render();
    shallowCanvasEl.style.display = 'none';
    $el.append(shallowCanvasEl);

    $el.attr('class', classNames.join(' '));
    contEl.addClass(`${pfx}editor-cont`).empty().append($el);
    modules.forEach((md) => md.postRender?.(this));

    return this;
  }

  private async sendTelemetryData() {
    const domain = getHostName();

    if (domain === 'localhost' || domain.includes('localhost')) {
      // Don't send telemetry data for localhost
      return;
    }

    const sessionKeyPrefix = 'gjs_telemetry_sent_';
    const { version } = this.model;
    const sessionKey = `${sessionKeyPrefix}${version}`;

    if (sessionStorage.getItem(sessionKey)) {
      // Telemetry already sent for version this session
      return;
    }

    const url = 'https://app.grapesjs.com';
    const response = await fetch(`${url}/api/gjs/telemetry/collect`, {
      method: 'POST',
      body: JSON.stringify({ domain, version }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send telemetry data ${await response.text()}`);
    }

    sessionStorage.setItem(sessionKey, 'true');

    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(sessionKeyPrefix) && key !== sessionKey) {
        sessionStorage.removeItem(key);
      }
    });

    this.trigger('telemetry:sent');
  }
}
