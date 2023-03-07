import Component from '../../dom_components/model/Component';

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
};

export default config;
