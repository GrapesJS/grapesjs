/**
 * Names of the default tools (without the `toolPrefix`).
 * Use them to reference tools, eg. when customizing the catalog.
 * @example
 * getTools: ({ tools }) => tools.filter(tool => tool.name !== ToolNames.loadProjectData)
 */
export enum ToolNames {
  // Guide
  getEditorGuide = 'get_editor_guide',

  // Editor
  getEditorState = 'get_editor_state',
  getPageCode = 'get_page_code',
  getProjectData = 'get_project_data',
  loadProjectData = 'load_project_data',
  undo = 'undo',
  redo = 'redo',

  // Components
  getComponents = 'get_components',
  selectComponents = 'select_components',
  addComponents = 'add_components',
  updateComponents = 'update_components',
  moveComponent = 'move_component',
  removeComponents = 'remove_components',
  getComponentTraits = 'get_component_traits',
  updateComponentTraits = 'update_component_traits',

  // CSS rules
  getCssRules = 'get_css_rules',
  setCssRules = 'set_css_rules',
  removeCssRules = 'remove_css_rules',

  // Blocks
  listBlocks = 'list_blocks',
  getBlock = 'get_block',
  insertBlock = 'insert_block',

  // Pages
  listPages = 'list_pages',
  addPage = 'add_page',
  renamePage = 'rename_page',
  selectPage = 'select_page',
  removePage = 'remove_page',

  // Devices
  listDevices = 'list_devices',
  selectDevice = 'select_device',

  // Assets
  listAssets = 'list_assets',
  addAssets = 'add_assets',
  removeAssets = 'remove_assets',
}
