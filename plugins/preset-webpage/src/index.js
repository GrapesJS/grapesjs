import ezygrapes from 'ezygrapes';
import commands from './commands';
import blocks from './blocks';
import components from './components';
import panels from './panels';
import i18n from './i18n';

import pluginExport from './commands/export';
import pluginBlocks from './components/basic-blocks';
import pluginCountdown from './components/countdown';
import pluginNavbar from './components/navbar';
import pluginForms from './components/forms';
import pluginAviary from './components/aviary';
import pluginFilestack from './components/filestack';
import pluginFontIcon from './components/font-icon';

export default ezygrapes.plugins.add('gjs-preset-webpage', (editor, opts = {}) => {

  i18n.addI18nMessages(editor);

  let config = {
    category: "basic",

    // Which blocks to add
    blocks: ['link-block', 'quote', 'text-basic'],

    // Import description inside import modal
    modalImportLabel: '',

    // Default content to setup on import model open.
    // Could also be a function with a dynamic content return (must be a string)
    // eg. modalImportContent: editor => editor.getHtml(),
    modalImportContent: '',

    // Code viewer (eg. CodeMirror) options
    importViewerOptions: {},

    // Show the Style Manager on component change
    showStylesOnChange: 1,

    // Use custom set of sectors for the Style Manager
    customStyleManager: [],

    // `grapesjs-blocks-basic` plugin options
    // By setting this option to `false` will avoid loading the plugin
    blocksBasicOpts: {},

    // `grapesjs-navbar` plugin options
    // By setting this option to `false` will avoid loading the plugin
    navbarOpts: {},

    // `grapesjs-component-countdown` plugin options
    // By setting this option to `false` will avoid loading the plugin
    countdownOpts: {},

    // `grapesjs-plugin-forms` plugin options
    // By setting this option to `false` will avoid loading the plugin
    formsOpts: {},

    // `grapesjs-plugin-export` plugin options
    // By setting this option to `false` will avoid loading the plugin
    exportOpts: {},

    // `grapesjs-aviary` plugin options, disabled by default
    // Aviary library should be included manually
    // By setting this option to `false` will avoid loading the plugin
    aviaryOpts: 0,

    // `grapesjs-plugin-filestack` plugin options, disabled by default
    // Filestack library should be included manually
    // By setting this option to `false` will avoid loading the plugin
    filestackOpts: 0,

    // `grapesjs-plugin-font-icon` plugin options, disabled by default
    // Font icon library should be included manually
    // By setting this option to `false` will avoid loading the plugin
    fontIconOpts: {},

    ...opts,
  };

  const {
    blocksBasicOpts,
    navbarOpts,
    countdownOpts,
    formsOpts,
    exportOpts,
    aviaryOpts,
    filestackOpts,
    fontIconOpts
  } = config;

  // Load plugins
  blocksBasicOpts && pluginBlocks(editor, blocksBasicOpts);
  navbarOpts && pluginNavbar(editor, navbarOpts);
  countdownOpts && pluginCountdown(editor, countdownOpts);
  formsOpts && pluginForms(editor, formsOpts);
  exportOpts && pluginExport(editor, exportOpts);
  aviaryOpts && pluginAviary(editor, aviaryOpts);
  filestackOpts && pluginFilestack(editor, filestackOpts);
  fontIconOpts && pluginFontIcon(editor, fontIconOpts);

  // Load components
  components(editor, config);

  // Load blocks
  blocks(editor, config);

  // Load commands
  commands(editor, config);

  // Load panels
  panels(editor, config);
})
