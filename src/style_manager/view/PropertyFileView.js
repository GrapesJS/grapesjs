import { isString } from 'underscore';
import PropertyView from './PropertyView';

export default class PropertyFileView extends PropertyView {
  events() {
    return {
      ...PropertyView.prototype.events,
      'click [data-clear-asset]': 'clear',
      'click [data-open-assets]': 'openAssetManager',
    };
  }

  templateInput() {
    const { pfx, em } = this;
    const icons = this.em?.getConfig().icons;
    const iconClose = icons?.close;

    return `
      <div class="${pfx}field ${pfx}file">
        <div id='${pfx}input-holder'>
          <div class="${pfx}btn-c">
            <button class="${pfx}btn" id="${pfx}images" type="button" data-open-assets>
              ${em.t('styleManager.fileButton')}
            </button>
          </div>
          <div style="clear:both;"></div>
        </div>
        <div id="${pfx}preview-box" class="${pfx}preview-file" data-preview-box>
          <div id="${pfx}preview-file" class="${pfx}preview-file-cnt" data-preview></div>
          <div id="${pfx}close" class="${pfx}preview-file-close" data-clear-asset>${iconClose}</div>
        </div>
      </div>
    `;
  }

  __setValueInput(value) {
    const { model, el } = this;
    const valueDef = model.getDefaultValue();
    const prvBoxEl = el.querySelector('[data-preview-box]');
    const prvEl = el.querySelector('[data-preview]');
    prvBoxEl.style.display = !value || value === valueDef ? 'none' : '';
    prvEl.style.backgroundImage = value || model.getDefaultValue();
  }

  openAssetManager() {
    const am = this.em?.get('AssetManager');

    am?.open({
      select: (asset, complete) => {
        const url = isString(asset) ? asset : asset.get('src');
        this.model.upValue(url, { partial: !complete });
        complete && am.close();
      },
      types: ['image'],
      accept: 'image/*',
    });
  }
}
