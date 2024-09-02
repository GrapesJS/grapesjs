import PanelManager from '..';
import { ModuleModel } from '../../abstract';
import { ObjectAny } from '../../common';
import { ResizerOptions } from '../../utils/Resizer';
import Buttons from './Buttons';

/** @private */
export interface PanelProperties {
  /**
   * Panel id.
   */
  id: string;

  /**
   * Panel content.
   */
  content?: string;

  /**
   * Panel visibility.
   * @default true
   */
  visible?: boolean;

  /**
   * Panel buttons.
   * @default []
   */
  buttons?: ObjectAny[];

  /**
   * Panel attributes.
   * @default {}
   */
  attributes?: ObjectAny;

  /**
   * Specify element query where to append the panel
   */
  appendTo?: string;

  /**
   * Resizable options.
   */
  resizable?: boolean | ResizerOptions;

  el?: string;

  appendContent?: HTMLElement;
}

export interface PanelPropertiesDefined extends Omit<Required<PanelProperties>, 'buttons'> {
  buttons: Buttons;
  [key: string]: unknown;
}

export default class Panel extends ModuleModel<PanelManager, PanelPropertiesDefined> {
  defaults() {
    return {
      id: '',
      content: '',
      visible: true,
      buttons: [] as unknown as Buttons,
      attributes: {},
    };
  }

  get buttons() {
    return this.get('buttons')!;
  }

  private set buttons(buttons: Buttons) {
    this.set('buttons', buttons);
  }

  view?: any;

  constructor(module: PanelManager, options: PanelProperties) {
    super(module, options as unknown as PanelPropertiesDefined);
    const btn = this.get('buttons') || [];
    this.buttons = new Buttons(module, btn as any);
  }
}
