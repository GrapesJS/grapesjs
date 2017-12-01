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
module.exports = () => {

  var c = {},
  defaults = require('./config/config'),
  gHtml = require('./model/HtmlGenerator'),
  gCss = require('./model/CssGenerator'),
  gJson = require('./model/JsonGenerator'),
  gJs = require('./model/JsGenerator'),
  eCM = require('./model/CodeMirrorEditor'),
  editorView = require('./view/EditorView');

  var generators = {},
  defGenerators  = {},
  viewers = {},
  defViewers = {};

  return {

    getConfig() {
      return c;
    },

    config: c,

    EditorView: editorView,

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'CodeManager',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     */
    init(config) {
      c = config || {};
      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      var ppfx = c.pStylePrefix;
      if(ppfx)
        c.stylePrefix = ppfx + c.stylePrefix;

      defGenerators.html = new gHtml();
      defGenerators.css  = new gCss();
      defGenerators.json = new gJson();
      defGenerators.js = new gJs();
      defViewers.CodeMirror = new eCM();
      this.loadDefaultGenerators().loadDefaultViewers();

      return this;
    },

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
    addGenerator(id, generator) {
      generators[id] = generator;
      return this;
    },

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
    getGenerator(id) {
      return generators[id] || null;
    },

    /**
     * Returns all code generators
     * @return {Array<Object>}
     * */
    getGenerators() {
      return generators;
    },

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
    addViewer(id, viewer) {
      viewers[id] = viewer;
      return this;
    },

    /**
     * Get code viewer by id
     * @param  {string} id Code viewer ID
     * @return {Object|null}
     * @example
     * var viewer = codeManager.getViewer('ace');
     * */
    getViewer(id) {
      return viewers[id] || null;
    },

    /**
     * Returns all code viewers
     * @return {Array<Object>}
     * */
    getViewers() {
      return viewers;
    },

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
    updateViewer(viewer, code) {
      viewer.setContent(code);
    },

    /**
     * Get code from model
     * @param  {Object} model Any kind of model that will be passed to the build method of generator
     * @param  {string} genId Code generator id
     * @param  {Object} [opt] Options
     * @return {string}
     * @example
     * var codeStr = codeManager.getCode(model, 'html');
     * */
    getCode(model, genId, opt = {}) {
      opt.em = c.em;
      var generator  = this.getGenerator(genId);
      return generator ? generator.build(model, opt) : '';
    },

    /**
     * Load default code generators
     * @return {this}
     * @private
     * */
    loadDefaultGenerators() {
      for (var id in defGenerators)
        this.addGenerator(id, defGenerators[id]);

      return this;
    },

    /**
     * Load default code viewers
     * @return {this}
     * @private
     * */
    loadDefaultViewers() {
      for (var id in defViewers)
        this.addViewer(id, defViewers[id]);

      return this;
    },

  };

};
