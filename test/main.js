import grapesjs from './../src';
//import AssetManager from './specs/asset_manager';

describe('Main', () => {

  describe('Startup', () => {
    it('Main object should be loaded', () => {
      //Grapes = require('editor/main');
      expect(grapesjs).toExist();
    });
  });

  const path = './specs/';
  require(`${path}asset_manager`);
  require(`${path}block_manager`);
  require(`${path}code_manager`);

});
