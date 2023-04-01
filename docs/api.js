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
    ['block_manager/index.ts', 'block_manager.md'],
    ['block_manager/model/Block.ts', 'block.md'],
    ['commands/index.ts', 'commands.md'],
    ['dom_components/index.ts', 'components.md'],
    ['dom_components/model/Component.ts', 'component.md'],
    ['panels/index.ts', 'panels.md'],
    ['style_manager/index.ts', 'style_manager.md'],
    ['style_manager/model/Sector.ts', 'sector.md'],
    ['style_manager/model/Property.ts', 'property.md'],
    ['style_manager/model/PropertyNumber.ts', 'property_number.md'],
    ['style_manager/model/PropertySelect.ts', 'property_select.md'],
    ['style_manager/model/PropertyComposite.ts', 'property_composite.md'],
    ['style_manager/model/PropertyStack.ts', 'property_stack.md'],
    ['style_manager/model/Layer.ts', 'layer.md'],
    ['storage_manager/index.ts', 'storage_manager.md'],
    ['device_manager/index.ts', 'device_manager.md'],
    ['device_manager/model/Device.ts', 'device.md'],
    ['selector_manager/index.ts', 'selector_manager.md'],
    ['selector_manager/model/Selector.ts', 'selector.md'],
    ['selector_manager/model/State.ts', 'state.md'],
    ['css_composer/index.ts', 'css_composer.md'],
    ['css_composer/model/CssRule.ts', 'css_rule.md'],
    ['modal_dialog/index.ts', 'modal_dialog.md'],
    ['rich_text_editor/index.ts', 'rich_text_editor.md'],
    ['keymaps/index.ts', 'keymaps.md'],
    ['undo_manager/index.ts', 'undo_manager.md'],
    ['canvas/index.ts', 'canvas.md'],
    ['canvas/model/Frame.ts', 'frame.md'],
    ['i18n/index.ts', 'i18n.md'],
    ['navigator/index.ts', 'layer_manager.md'],
    ['pages/index.ts', 'pages.md'],
    ['pages/model/Page.ts', 'page.md'],
    ['parser/index.ts', 'parser.md'],
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
          .replace('**Extends ModuleModel**', '')
          .replace('**Extends Model**', '');
        fs.writeFileSync(`${docRoot}/api/${file[1]}`, res);
        log('Created', file[1]);
      });
  }));

  log('API Reference generation done!');
};

generateDocs();
