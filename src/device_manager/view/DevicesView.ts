import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import html from '../../utils/html';
import Devices from '../model/Devices';

export interface DevicesViewConfig {
  em: EditorModel;
  pStylePrefix?: string;
}

export default class DevicesView extends View {
  em: EditorModel;
  config: DevicesViewConfig;
  ppfx: string;
  devicesEl?: JQuery<HTMLElement>;

  template({ ppfx, label }: { ppfx: string; label: string }) {
    return html`
      <div class="${ppfx}device-label">${label}</div>
      <div class="${ppfx}field ${ppfx}select">
        <span id="${ppfx}input-holder">
          <select class="${ppfx}devices"></select>
        </span>
        <div class="${ppfx}sel-arrow">
          <div class="${ppfx}d-s-arrow"></div>
        </div>
      </div>
      <button style="display:none" class="${ppfx}add-trasp" data-add-trasp>+</button>
    `;
  }

  events() {
    return {
      change: 'updateDevice',
      'click [data-add-trasp]': 'startAdd',
    };
  }

  constructor(o: { config: DevicesViewConfig; collection: Devices }) {
    super(o);
    this.config = o.config || {};
    this.em = this.config.em;
    this.ppfx = this.config.pStylePrefix || '';
    this.listenTo(this.em, 'change:device', this.updateSelect);
  }

  /**
   * Start adding new device
   * @return {[type]} [description]
   * @private
   */
  startAdd() {}

  /**
   * Update device of the editor
   * @private
   */
  updateDevice() {
    const { em } = this;

    if (em) {
      const devEl = this.devicesEl;
      em.set('device', devEl ? devEl.val() : '');
    }
  }

  /**
   * Update select value on device update
   * @private
   */
  updateSelect() {
    const { em, devicesEl } = this;

    if (em && em.getDeviceModel && devicesEl) {
      const device = em.getDeviceModel();
      devicesEl.val(device ? device.get('id') : '');
    }
  }

  /**
   * Return devices options
   * @return {string} String of options
   * @private
   */
  getOptions() {
    const { collection, em } = this;
    let result = '';

    collection.forEach(device => {
      const { name, id } = device.attributes;
      const label = (em && em.t && em.t(`deviceManager.devices.${id}`)) || name;
      result += `<option value="${id || name}">${label}</option>`;
    });

    return result;
  }

  render() {
    const { em, ppfx, $el, el } = this;
    const label = em && em.t && em.t('deviceManager.device');
    $el.html(this.template({ ppfx, label }));
    this.devicesEl = $el.find(`.${ppfx}devices`);
    this.devicesEl.append(this.getOptions());
    this.devicesEl.val(em.get('device'));
    el.className = `${ppfx}devices-c`;
    return this;
  }
}
