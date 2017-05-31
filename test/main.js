import expect from 'expect';
import sinon from 'sinon';
import grapesjs from './../src';
//import AssetManager from './specs/asset_manager';

describe('Main', () => {

  describe('Startup', () => {
    it('Main object should be loaded', () => {
      //Grapes = require('editor/main');
      expect(grapesjs).toExist();
    });
  });

  require('./specs/asset_manager/main.js');

});
