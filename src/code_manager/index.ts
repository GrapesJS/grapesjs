/**
 * - [addGenerator](#addgenerator)
 * - [getGenerator](#getgenerator)
 * - [getGenerators](#getgenerators)
 * - [addViewer](#addviewer)
 * - [getViewer](#getviewer)
 * - [getViewers](#getviewers)
 * - [updateViewer](#updateviewer)
 * - [getCode](#getcode)
 *
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var codeManager = editor.CodeManager;
 * ```
 *
 * @module CodeManager
 */
import { isUndefined } from 'underscore';
import defaults, { CodeManagerConfig } from './config/config';
import gHtml from './model/HtmlGenerator';
import gCss from './model/CssGenerator';
import gJson from './model/JsonGenerator';
import gJs from './model/JsGenerator';
import eCM from './model/CodeMirrorEditor';
import editorView from './view/EditorView';
import { Module } from '../abstract';
import EditorModel from '../editor/model/Editor';

const defaultViewer = 'CodeMirror';

export default class CodeManagerModule extends Module<CodeManagerConfig & { pStylePrefix?: string }> {
  defGenerators: Record<string, any>;
  defViewers: Record<string, any>;
  generators: Record<string, any>;
  viewers: Record<string, any>;

  EditorView = editorView;

  constructor(em: EditorModel) {
    super(em, 'CodeManager', defaults);
    const { config } = this;
    const ppfx = config.pStylePrefix;
    if (ppfx) config.stylePrefix = ppfx + config.stylePrefix;

    this.generators = {};
    this.viewers = {};
    this.defGenerators = {
      html: new gHtml(),
      css: new gCss(),
      json: new gJson(),
      js: new gJs(),
    };
    this.defViewers = { CodeMirror: new eCM() };
    this.loadDefaultGenerators().loadDefaultViewers();
  }

  /**
   * Add new code generator to the collection
   * @param  {string} id Code generator ID
   * @param  {Object} generator Code generator wrapper
   * @param {Function} generator.build Function that builds the code
   * @return {this}
   * @example
   * codeManager.addGenerator('html7',{
   *   build: function(model){
   *    return 'myCode';
   *   }
   * });
   * */
  addGenerator(id: string, generator: any) {
    this.generators[id] = generator;
    return this;
  }

  /**
   * Get code generator by id
   * @param  {string} id Code generator ID
   * @return {Object|null}
   * @example
   * var generator = codeManager.getGenerator('html7');
   * generator.build = function(model){
   *   //extend
   * };
   * */
  getGenerator(id: string) {
    return this.generators[id];
  }

  /**
   * Returns all code generators
   * @return {Array<Object>}
   * */
  getGenerators() {
    return this.generators;
  }

  /**
   * Add new code viewer
   * @param  {string} id Code viewer ID
   * @param  {Object} viewer Code viewer wrapper
   * @param {Function} viewer.init Set element on which viewer will be displayed
   * @param {Function} viewer.setContent Set content to the viewer
   * @return {this}
   * @example
   * codeManager.addViewer('ace',{
   *   init: function(el){
   *     var ace = require('ace-editor');
   *     this.editor  = ace.edit(el.id);
   *   },
   *   setContent: function(code){
   *    this.editor.setValue(code);
   *   }
   * });
   * */
  addViewer(id: string, viewer: any) {
    this.viewers[id] = viewer;
    return this;
  }

  /**
   * Get code viewer by id
   * @param  {string} id Code viewer ID
   * @return {Object|null}
   * @example
   * var viewer = codeManager.getViewer('ace');
   * */
  getViewer(id: string) {
    return this.viewers[id];
  }

  /**
   * Returns all code viewers
   * @return {Array<Object>}
   * */
  getViewers() {
    return this.viewers;
  }

  createViewer(opts: any = {}) {
    const type = !isUndefined(opts.type) ? opts.type : defaultViewer;
    const viewer = this.getViewer(type) && this.getViewer(type).clone();
    const cont = document.createElement('div');
    const txtarea = document.createElement('textarea');
    cont.appendChild(txtarea);
    viewer.set(opts);
    viewer.init(txtarea);
    viewer.setElement(cont);

    return viewer;
  }

  /**
   * Update code viewer content
   * @param  {Object} viewer Viewer instance
   * @param  {string} code  Code string
   * @example
   * var AceViewer = codeManager.getViewer('ace');
   * // ...
   * var viewer = AceViewer.init(el);
   * // ...
   * codeManager.updateViewer(AceViewer, 'code');
   * */
  updateViewer(viewer: any, code: string) {
    viewer.setContent(code);
  }

  /**
   * Get code from model
   * @param  {Object} model Any kind of model that will be passed to the build method of generator
   * @param  {string} genId Code generator id
   * @param  {Object} [opt] Options
   * @return {string}
   * @example
   * var codeStr = codeManager.getCode(model, 'html');
   * */
  getCode(model: any, genId: string, opt: any = {}) {
    opt.em = this.em;
    const generator = this.getGenerator(genId);
    return generator ? generator.build(model, opt) : '';
  }

  /**
   * Load default code generators
   * @return {this}
   * @private
   * */
  loadDefaultGenerators() {
    for (const id in this.defGenerators) {
      this.addGenerator(id, this.defGenerators[id]);
    }

    return this;
  }

  /**
   * Load default code viewers
   * @return {this}
   * @private
   * */
  loadDefaultViewers() {
    for (const id in this.defViewers) {
      this.addViewer(id, this.defViewers[id]);
    }

    return this;
  }

  destroy() {}
}
