const fs = require('fs');
const Backbone = require('backbone');

let modifiedFiles = [];

const exportJsonToFile = (filePath, content) => {
  let fileContent = `define([], function() { return ${JSON.stringify(content)} });`;
  fs.writeFileSync(filePath, fileContent);
};

const copyFile = (filePath) => {
  let newFileName = `${filePath}-copy`;
  fs.copyFileSync(filePath, newFileName);
  modifiedFiles.push({
    original: filePath,
    copy: newFileName
  });
  return `${filePath}-copy`;
};

const removeImportExportStatements = (filePath) => {
  let copyFilePath = copyFile(filePath);
  let fileContent = fs.readFileSync(copyFilePath, 'utf8');
  fileContent = fileContent.replace(/import (.*) from (.*);/g, "const $1 = require($2);");
  fileContent = fileContent.replace(/export default/g, "module.exports = ");
  fs.writeFileSync(copyFilePath, fileContent);
};

const rewriteComponentJsFile = (filePath) => {
  let copyFilePath = copyFile(filePath);
  let fileContent = fs.readFileSync(copyFilePath, 'utf8');
  fileContent = fileContent.replace(/import(.|\n)*underscore';/, '');
  fileContent = fileContent.replace(/import(.)*utils\/mixins';/, '');
  fileContent = fileContent.replace(/import(.)*Styleable';/, '');

  fileContent = fileContent.replace(/require\('selector_manager\/model\//g, "require('../../selector_manager/model/");
  fileContent = fileContent.replace(/require\('trait_manager\/model\//, "require('../../trait_manager/model/");
  fileContent = fileContent.replace(/Backbone.Model.extend\(Styleable\).extend/, 'Backbone.Model.extend');

  fs.writeFileSync(filePath, fileContent);
};

const restoreModifiedFiles = () => {
  modifiedFiles.forEach(file => {
    fs.unlinkSync(file.original);
    fs.renameSync(file.copy, file.original);
  });
};

const getGrapesJSEditor = () => {
  let editor = {
    properties: []
  };
  editor.DomComponents = {
    addType: (type, object) => {
      editor.properties.push({
        type: type,
        props: (new object.model()).attributes.traits
      });
    },
    getType: () => {
      return {
        model: Backbone.Model.extend({
          defaults: {
            traits: ['id', 'title']
          }
        }),
        view: Backbone.View.extend({})
      }
    }
  };

  editor.TraitManager = {
    addType: () => {
      //console.log('Add type method in trait manager');
    },
    getType: () => {
      //console.log('get type method in trait manager');
    }
  };

  editor.BlockManager = {
    add: () => {
      //console.log('In add method of block manager')
    }
  };
  return editor;
};

module.exports = {
  exportJsonToFile: exportJsonToFile,
  copyFile: copyFile,
  removeImportExportStatements: removeImportExportStatements,
  rewriteComponentJsFile: rewriteComponentJsFile,
  restoreModifiedFiles: restoreModifiedFiles,
  getGrapesJSEditor: getGrapesJSEditor
};
