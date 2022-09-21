// This script uses documentation to generate API Reference files
const path = require('path');
const documentation = require('documentation');
const fs = require('fs');
const docRoot = __dirname;
const srcRoot = path.join(docRoot, '../src/');

const log = (...args) => console.log(...args);

async function generateDocs () {
  log('Start API Reference generation...');

  await Promise.all([
    ['editor/index.ts', 'editor.md'],
    ['asset_manager/index.ts', 'assets.md'],
    ['asset_manager/model/Asset.ts', 'asset.md'],
    ['block_manager/index.js', 'block_manager.md'],
    ['block_manager/model/Block.js', 'block.md'],
    ['commands/index.js', 'commands.md'],
    ['dom_components/index.ts', 'components.md'],
    ['dom_components/model/Component.js', 'component.md'],
    ['panels/index.ts', 'panels.md'],
    ['style_manager/index.js', 'style_manager.md'],
    ['style_manager/model/Sector.js', 'sector.md'],
    ['style_manager/model/Property.js', 'property.md'],
    ['style_manager/model/PropertyNumber.js', 'property_number.md'],
    ['style_manager/model/PropertySelect.js', 'property_select.md'],
    ['style_manager/model/PropertyComposite.js', 'property_composite.md'],
    ['style_manager/model/PropertyStack.js', 'property_stack.md'],
    ['style_manager/model/Layer.js', 'layer.md'],
    ['storage_manager/index.js', 'storage_manager.md'],
    ['device_manager/index.js', 'device_manager.md'],
    ['device_manager/model/Device.js', 'device.md'],
    ['selector_manager/index.ts', 'selector_manager.md'],
    ['selector_manager/model/Selector.ts', 'selector.md'],
    ['selector_manager/model/State.ts', 'state.md'],
    ['css_composer/index.js', 'css_composer.md'],
    ['css_composer/model/CssRule.js', 'css_rule.md'],
    ['modal_dialog/index.ts', 'modal_dialog.md'],
    ['rich_text_editor/index.js', 'rich_text_editor.md'],
    ['keymaps/index.js', 'keymaps.md'],
    ['undo_manager/index.js', 'undo_manager.md'],
    ['canvas/index.ts', 'canvas.md'],
    ['canvas/model/Frame.ts', 'frame.md'],
    ['i18n/index.js', 'i18n.md'],
    ['navigator/index.ts', 'layer_manager.md'],
    ['pages/index.ts', 'pages.md'],
    ['pages/model/Page.ts', 'page.md'],
    ['parser/index.js', 'parser.md'],
  ].map(async (file) => {
    const filePath = `${srcRoot}/${file[0]}`;

    if (!fs.existsSync(filePath)) {
      throw `File not found '${filePath}'`;
    }

    return documentation.build([filePath], { shallow: true })
      .then(cm => documentation.formats.md(cm, /*{ markdownToc: true }*/))
      .then(output => {
        const res = output
          .replace(/\*\*\\\[/g, '**[')
          .replace(/\*\*\(\\\[/g, '**([')
          .replace(/<\\\[/g, '<[')
          .replace(/<\(\\\[/g, '<([')
          .replace(/\| \\\[/g, '| [')
          .replace(/\\n```js/g, '```js')
          .replace(/docsjs\./g, '')
          .replace('**Extends Model**', '');
        fs.writeFileSync(`${docRoot}/api/${file[1]}`, res);
        log('Created', file[1]);
      });
  }));

  log('API Reference generation done!');
};

generateDocs();
