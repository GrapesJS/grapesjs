import { forEach, result } from 'underscore';
import { PageManagerConfig } from '..';
import Frames from '../../canvas/model/Frames';
import { Model } from '../../common';
import ComponentWrapper from '../../dom_components/model/ComponentWrapper';
import EditorModel from '../../editor/model/Editor';
import { CssRuleJSON } from '../../css_composer/model/CssRule';
import { ComponentDefinition } from '../../dom_components/model/types';

/** @private */
export interface PageProperties {
  /**
   * Panel id.
   */
  id?: string;

  /**
   * Page name.
   */
  name?: string;

  /**
   * HTML to load as page content.
   */
  component?: string | ComponentDefinition | ComponentDefinition[];

  /**
   * CSS to load with the page.
   */
  styles?: string | CssRuleJSON[];

  [key: string]: unknown;
}

export interface PagePropertiesDefined extends Pick<PageProperties, 'id' | 'name'> {
  frames: Frames;
  [key: string]: unknown;
}

export default class Page extends Model<PagePropertiesDefined> {
  defaults() {
    return {
      name: '',
      frames: [] as unknown as Frames,
      _undo: true,
    };
  }
  em: EditorModel;

  constructor(props: any, opts: { em?: EditorModel; config?: PageManagerConfig } = {}) {
    super(props, opts);
    const { em } = opts;
    const defFrame: any = {};
    this.em = em!;
    if (!props.frames) {
      defFrame.component = props.component;
      defFrame.styles = props.styles;
      ['component', 'styles'].map(i => this.unset(i));
    }
    const frms: any[] = props.frames || [defFrame];
    const frames = new Frames(em!.Canvas, frms);
    frames.page = this;
    this.set('frames', frames);
    !this.getId() && this.set('id', em?.Pages._createId());
    em?.UndoManager.add(frames);
  }

  onRemove() {
    this.getFrames().reset();
  }

  getFrames() {
    return this.get('frames')!;
  }

  /**
   * Get page id
   * @returns {String}
   */
  getId() {
    return this.id as string;
  }

  /**
   * Get page name
   * @returns {String}
   */
  getName() {
    return this.get('name')!;
  }

  /**
   * Update page name
   * @param {String} name New page name
   * @example
   * page.setName('New name');
   */
  setName(name: string) {
    return this.set({ name });
  }

  /**
   * Get all frames
   * @returns {Array<Frame>}
   * @example
   * const arrayOfFrames = page.getAllFrames();
   */
  getAllFrames() {
    return this.getFrames().models || [];
  }

  /**
   * Get the first frame of the page (identified always as the main one)
   * @returns {Frame}
   * @example
   * const mainFrame = page.getMainFrame();
   */
  getMainFrame() {
    return this.getFrames().at(0);
  }

  /**
   * Get the root component (usually is the `wrapper` component) from the main frame
   * @returns {Component}
   * @example
   * const rootComponent = page.getMainComponent();
   * console.log(rootComponent.toHTML());
   */
  getMainComponent(): ComponentWrapper {
    const frame = this.getMainFrame();
    return frame?.getComponent();
  }

  toJSON(opts = {}) {
    const obj = Model.prototype.toJSON.call(this, opts);
    const defaults = result(this, 'defaults');

    // Remove private keys
    forEach(obj, (value, key) => {
      key.indexOf('_') === 0 && delete obj[key];
    });

    forEach(defaults, (value, key) => {
      if (obj[key] === value) delete obj[key];
    });

    return obj;
  }
}
