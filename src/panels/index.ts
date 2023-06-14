/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/panels/config/config.ts)
 * ```js
 * const editor = grapesjs.init({
 *  panels: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const panelManager = editor.Panels;
 * ```
 *
 * * [addPanel](#addpanel)
 * * [addButton](#addbutton)
 * * [getButton](#getbutton)
 * * [getPanel](#getpanel)
 * * [getPanels](#getpanels)
 * * [getPanelsEl](#getpanelsel)
 * * [removePanel](#removepanel)
 * * [removeButton](#removebutton)
 *
 * @module Panels
 */
import { Module } from '../abstract';
import EditorModel from '../editor/model/Editor';
import defaults, { PanelsConfig } from './config/config';
import Panel, { PanelProperties } from './model/Panel';
import Panels from './model/Panels';
import PanelsView from './view/PanelsView';

export default class PanelManager extends Module<PanelsConfig> {
  panels: Panels;
  PanelsViewObj?: PanelsView;

  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'Panels', defaults);
    this.panels = new Panels(this, this.config.defaults!);
    for (var name in defaults) {
      //@ts-ignore
      if (!(name in this.config)) this.config[name] = defaults[name];
    }
    return this;
  }

  /**
   * Returns the collection of panels
   * @return {Collection} Collection of panel
   */
  getPanels() {
    return this.panels;
  }

  /**
   * Returns panels element
   * @return {HTMLElement}
   */
  getPanelsEl() {
    return this.PanelsViewObj?.el;
  }

  /**
   * Add new panel to the collection
   * @param {Object|Panel} panel Object with right properties or an instance of Panel
   * @return {Panel} Added panel. Useful in case passed argument was an Object
   * @example
   * const newPanel = panelManager.addPanel({
   *  id: 'myNewPanel',
   *  visible: true,
   *  buttons: [...],
   * });
   */
  addPanel(panel: Panel | PanelProperties) {
    return this.panels.add(panel as Panel);
  }

  /**
   * Remove a panel from the collection
   * @param {Panel|String} panel Panel instance or panel id
   * @return {Panel} Removed panel
   * @example
   * const somePanel = panelManager.getPanel('somePanel');
   * const removedPanel = panelManager.removePanel(somePanel);
   *
   * // or by id
   * const removedPanel = panelManager.removePanel('myNewPanel');
   *
   */
  removePanel(panel: Panel | string) {
    return this.panels.remove(panel);
  }

  /**
   * Get panel by ID
   * @param  {string} id Id string
   * @return {Panel|null}
   * @example
   * const myPanel = panelManager.getPanel('myPanel');
   */
  getPanel(id: string) {
    const res = this.panels.where({ id });
    return res.length ? res[0] : null;
  }

  /**
   * Add button to the panel
   * @param {string} panelId Panel's ID
   * @param {Object|Button} button Button object or instance of Button
   * @return {Button|null} Added button. Useful in case passed button was an Object
   * @example
   * const newButton = panelManager.addButton('myNewPanel',{
   *   id: 'myNewButton',
   *   className: 'someClass',
   *   command: 'someCommand',
   *   attributes: { title: 'Some title'},
   *   active: false,
   * });
   * // It's also possible to pass the command as an object
   * // with .run and .stop methods
   * ...
   * command: {
   *   run: function(editor) {
   *     ...
   *   },
   *   stop: function(editor) {
   *     ...
   *   }
   * },
   * // Or simply like a function which will be evaluated as a single .run command
   * ...
   * command: function(editor) {
   *   ...
   * }
   */
  addButton(panelId: string, button: any) {
    const pn = this.getPanel(panelId);
    return pn ? pn.buttons.add(button) : null;
  }

  /**
   * Remove button from the panel
   * @param {String} panelId Panel's ID
   * @param {String} buttonId Button's ID
   * @return {Button|null} Removed button.
   * @example
   * const removedButton = panelManager.addButton('myNewPanel',{
   *   id: 'myNewButton',
   *   className: 'someClass',
   *   command: 'someCommand',
   *   attributes: { title: 'Some title'},
   *   active: false,
   * });
   *
   * const removedButton = panelManager.removeButton('myNewPanel', 'myNewButton');
   *
   */
  removeButton(panelId: string, button: any) {
    const pn = this.getPanel(panelId);
    return pn && pn.buttons.remove(button);
  }

  /**
   * Get button from the panel
   * @param {string} panelId Panel's ID
   * @param {string} id Button's ID
   * @return {Button|null}
   * @example
   * const button = panelManager.getButton('myPanel', 'myButton');
   */
  getButton(panelId: string, id: string) {
    const pn = this.getPanel(panelId);
    if (pn) {
      const res = pn.buttons.where({ id });
      return res.length ? res[0] : null;
    }
    return null;
  }

  /**
   * Render panels and buttons
   * @return {HTMLElement}
   * @private
   */
  render() {
    this.PanelsViewObj?.remove();
    this.PanelsViewObj = new PanelsView(this.panels);
    return this.PanelsViewObj.render().el;
  }

  /**
   * Active activable buttons
   * @private
   */
  active() {
    this.getPanels().each(p => {
      p.buttons.each(btn => {
        btn.get('active') && btn.trigger('updateActive');
      });
    });
  }

  /**
   * Disable buttons flagged as disabled
   * @private
   */
  disableButtons() {
    this.getPanels().each(p => {
      p.buttons.each(btn => {
        if (btn.get('disable')) btn.trigger('change:disable');
      });
    });
  }

  destroy() {
    this.panels.reset();
    this.panels.stopListening();
    this.PanelsViewObj && this.PanelsViewObj.remove();
  }
}
