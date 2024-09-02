import Component from '../../dom_components/model/Component';
import { CanvasSpotBuiltInTypes } from '../model/CanvasSpot';

export interface CanvasConfig {
  stylePrefix?: string;

  /**
   * Append external scripts to the `<head>` of the iframe.
   * Be aware that these scripts will not be printed in the export code.
   * @default []
   * @example
   * scripts: [ 'https://...1.js', 'https://...2.js' ]
   * // or passing objects as attributes
   * scripts: [ { src: '/file.js', someattr: 'value' }, ... ]
   */
  scripts?: (string | Record<string, any>)[];

  /**
   * Append external styles to the `<head>` of the iframe.
   * Be aware that these scripts will not be printed in the export code.
   * @default []
   * @example
   * styles: [ 'https://...1.css', 'https://...2.css' ]
   * // or passing objects as attributes
   * styles: [ { href: '/style.css', someattr: 'value' }, ... ]
   */
  styles?: (string | Record<string, any>)[];

  /**
   * Add custom badge naming strategy.
   * @example
   * customBadgeLabel: component => component.getName(),
   */
  customBadgeLabel?: (component: Component) => string;

  /**
   * Indicate when to start the autoscroll of the canvas on component/block dragging (value in px).
   * @default 50
   */
  autoscrollLimit?: number;

  /**
   * Experimental: external highlighter box
   */
  extHl?: boolean;

  /**
   * Initial content to load in all frames.
   * The default value enables the standard mode for the iframe.
   * @default '<!DOCTYPE html>'
   */
  frameContent?: string;

  /**
   * Initial style to load in all frames.
   */
  frameStyle?: string;

  /**
   * When some textable component is selected and focused (eg. input or text component), the editor
   * stops some commands (eg. disables the copy/paste of components with CTRL+C/V to allow the copy/paste of the text).
   * This option allows to customize, by a selector, which element should not be considered textable.
   */
  notTextable?: string[];

  /**
   * By default, the editor allows to drop external elements by relying on the native HTML5
   * drag & drop API (eg. like a D&D of an image file from your desktop).
   * If you want to customize how external elements are interpreted by the editor, you can rely
   * on `canvas:dragdata` event, eg. https://github.com/GrapesJS/grapesjs/discussions/3849
   * @default true
   */
  allowExternalDrop?: boolean;

  /**
   * Disable the rendering of built-in canvas spots.
   *
   * Read here for more information about [Canvas Spots](https://grapesjs.com/docs/modules/Canvas.html#canvas-spots).
   * @example
   * // Disable only the hover type spot
   * customSpots: { hover: true },
   *
   * // Disable all built-in spots
   * customSpots: true,
   */
  customSpots?: boolean | Partial<Record<CanvasSpotBuiltInTypes, boolean>>;

  /**
   * Experimental: enable infinite canvas.
   */
  infiniteCanvas?: boolean;
}

const config: CanvasConfig = {
  stylePrefix: 'cv-',
  scripts: [],
  styles: [],
  customBadgeLabel: undefined,
  autoscrollLimit: 50,
  extHl: false,
  frameContent: '<!DOCTYPE html>',
  frameStyle: `
    body { background-color: #fff }
    * ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1) }
    * ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2) }
    * ::-webkit-scrollbar { width: 10px }
  `,
  notTextable: ['button', 'a', 'input[type=checkbox]', 'input[type=radio]'],
  allowExternalDrop: true,
};

export default config;
