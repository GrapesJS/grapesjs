const utils = require('./utils');

//Rewrite component.js file to remove breaking imports and correct file paths where required
utils.rewriteComponentJsFile('./src/dom_components/model/Component.js');

//Rewrite files to remove used imports.. this is required for external plugins
utils.removeImportExportStatements('./node_modules/grapesjs-plugin-forms/src/index.js');
utils.removeImportExportStatements('./node_modules/grapesjs-plugin-forms/src/traits.js');
utils.removeImportExportStatements('./node_modules/grapesjs-plugin-forms/src/blocks.js');
utils.removeImportExportStatements('./node_modules/grapesjs-plugin-forms/src/components.js');

try {
  let properties = [];
  let editor = utils.getGrapesJSEditor();

  let componentList = [
    /*{
      name: "image",
      filePath: "./../src/dom_components/model/ComponentImage",
      externalComponent: false
    },*/
    {
      name: "link",
      filePath: "./../src/dom_components/model/ComponentLink",
      externalComponent: false
    },
    /*{
      name: "video",
      filePath: "./../src/dom_components/model/ComponentVideo",
      externalComponent: false
    },*/
    {
      name: "form",
      filePath: "grapesjs-plugin-forms/src/index",
      externalComponent: true
    }
  ];

  componentList.forEach(componentDetails => {
    if (!componentDetails.externalComponent) {
      let componentClass = require(componentDetails.filePath);
      let component = new componentClass();
      let traits = component.attributes.traits.map(trait => {
        trait = JSON.parse(JSON.stringify(trait));
        return {
          name: trait.name,
          type: trait.type,
          label: trait.label,
          options: trait.options
        }
      });
      properties.push({
        type: componentDetails.name,
        props: traits
      });
    } else {
      let plugin = require(componentDetails.filePath);
      plugin(editor);
      properties = properties.concat(editor.properties);
    }
  });

  //Run the properties through trait factory to add some default values like values for target attribute etc.
  let TraitManagerConfig = require('../src/trait_manager/config/config');
  let TraitsFactory = require('../src/trait_manager/model/TraitFactory')(TraitManagerConfig);
  properties.forEach(property => {
    property.props.forEach(prop => {
      if (prop.name) {
        Object.assign(prop, TraitsFactory.build(prop.name)[0]);
      }
    })
  });

  //Export all properties except anchor in a js file
  let elementProperties = properties.filter(property => property.type !== 'link');

  //add an exception for SELECT element -> Remove options property
  elementProperties.forEach(property => {
    if (property.type === 'select') {
      property.props = property.props.filter(prop => prop.label !== 'Options');
    }
  });
  utils.exportJsonToFile('build/dist/grapes-properties.js', elementProperties);
  console.log('Properties exported successfully');

  //Export anchor tag properties in a separate file
  let anchorTagProperties = properties.find(property => property.type === 'link');
  anchorTagProperties.type = 'a';
  anchorTagProperties.props = anchorTagProperties.props.filter(property => property.name !== 'title');
  utils.exportJsonToFile('build/dist/grapes-properties-anchortag.js', [anchorTagProperties]);
  console.log('Anchor tag properties exported successfully');

} catch(e) {
  console.log(e);
} finally {
  utils.restoreModifiedFiles();
}

