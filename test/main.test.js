import grapesjs from './../src';

describe('Main', () => {
  describe('Startup', () => {
    test('Main object should be loaded', () => {
      expect(grapesjs).toBeTruthy();
    });
  });

  const path = './specs/';
  require(`${path}keymaps`);
  require(`${path}asset_manager`);
  require(`${path}block_manager`);
  require(`${path}code_manager`);
  require(`${path}commands`);
  require(`${path}css_composer`);
  require(`${path}device_manager`);
  require(`${path}dom_components`);
  require(`${path}modal`);
  require(`${path}panels`);
  require(`${path}parser`);
  require(`${path}plugin_manager`);
  require(`${path}selector_manager`);
  require(`${path}storage_manager`);
  require(`${path}style_manager`);
  require(`${path}trait_manager`);
  require(`${path}grapesjs`);
});
