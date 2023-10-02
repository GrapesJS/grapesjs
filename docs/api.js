// This script uses documentation to generate API Reference files
const path = require('path');
const documentation = require('documentation');
const fs = require('fs');
const docRoot = __dirname;
const srcRoot = path.join(docRoot, '../src/');
const START_EVENTS = '{START_EVENTS}';
const END_EVENTS = '{END_EVENTS}';
const REPLACE_EVENTS = '{REPLACE_EVENTS}';

const log = (...args) => console.log(...args);

const getEventsMdFromTypes = async (filePath) => {
  const dirname = filePath.replace(path.basename(filePath), '');
  const typesFilePath = `${dirname}types.ts`;

  if (fs.existsSync(typesFilePath)) {
    const resTypes = await documentation.build([typesFilePath], { shallow: true })
      .then(cm => documentation.formats.md(cm, /*{ markdownToc: true }*/));
    const indexFrom = resTypes.indexOf(START_EVENTS) + START_EVENTS.length;
    const indexTo = resTypes.indexOf(END_EVENTS);
    // console.log(`${resTypes}`)
    const result = resTypes.substring(indexFrom, indexTo)
      .replace(/\n### Examples\n/gi, '')
      .replace(/\n## types\n/gi, '')
      .replace(/## /gi, '* ')
      .replace(/\\`/gi, '`')
      .replace(/##/gi, '')
      .replace(/\\\[/gi, '[')
      .trim();

    return result
  }

  return '';
}

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
    ['canvas/model/CanvasSpot.ts', 'canvas_spot.md'],
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
      .then(async (output) => {
        let addLogs = [];
        let result = output
          .replace(/\*\*\\\[/g, '**[')
          .replace(/\*\*\(\\\[/g, '**([')
          .replace(/<\\\[/g, '<[')
          .replace(/<\(\\\[/g, '<([')
          .replace(/\| \\\[/g, '| [')
          .replace(/\\n```js/g, '```js')
          .replace(/docsjs\./g, '')
          .replace('**Extends ModuleModel**', '')
          .replace('**Extends Model**', '');

        // Search for module event documentation
        if (result.indexOf(REPLACE_EVENTS) >= 0) {
          const eventsMd = await getEventsMdFromTypes(filePath);
          if (eventsMd && result.indexOf(REPLACE_EVENTS) >= 0) {
            addLogs.push('replaced events');
          }
          result = eventsMd ? result.replace(REPLACE_EVENTS, `## Available Events\n${eventsMd}`) : result;
        }

        fs.writeFileSync(`${docRoot}/api/${file[1]}`, result);
        log('Created', file[1], addLogs.length ? `(${addLogs.join(', ')})` : '');
      });
  }));

  log('API Reference generation done!');
};

generateDocs();
