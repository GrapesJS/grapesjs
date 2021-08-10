// This script uses documentation to generate API Reference files
const path = require('path');
const exec = require('child_process').exec;
const docRoot = __dirname;
const srcRoot = path.join(docRoot, '../src/');
const binRoot = path.join(docRoot, '../node_modules/.bin/');
const cmds = [
  ['editor/index.js', 'editor.md'],
  ['asset_manager/index.js', 'assets.md'],
  ['block_manager/index.js', 'block_manager.md'],
  ['commands/index.js', 'commands.md'],
  ['dom_components/index.js', 'components.md'],
  ['dom_components/model/Component.js', 'component.md'],
  ['panels/index.js', 'panels.md'],
  ['style_manager/index.js', 'style_manager.md'],
  ['storage_manager/index.js', 'storage_manager.md'],
  ['device_manager/index.js', 'device_manager.md'],
  ['selector_manager/index.js', 'selector_manager.md'],
  ['css_composer/index.js', 'css_composer.md'],
  ['css_composer/model/CssRule.js', 'css_rule.md'],
  ['modal_dialog/index.js', 'modal_dialog.md'],
  ['rich_text_editor/index.js', 'rich_text_editor.md'],
  ['keymaps/index.js', 'keymaps.md'],
  ['undo_manager/index.js', 'undo_manager.md'],
  ['canvas/index.js', 'canvas.md'],
  ['i18n/index.js', 'i18n.md'],
  ['pages/index.js', 'pages.md'],
  ['pages/model/Page.js', 'page.md'],
  ['parser/index.js', 'parser.md'],
].map(entry =>
  `${binRoot}documentation build ${srcRoot}/${entry[0]} -o ${docRoot}/api/${entry[1]} -f md --shallow --markdown-toc false`)
.join(' && ');

console.log('Start API Reference generation...');
exec(cmds, (error, stdout, stderr) => {
  if (error) {
    console.error( 'Failed to update API Reference: ', error);
    return;
  }

  stdout.trim().split('\n').forEach(function (line) {
    console.info(line);
  });

  console.log('API Reference generation done!');
});
