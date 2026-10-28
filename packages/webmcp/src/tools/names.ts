/**
 * Names of the default tools (without the `toolPrefix`).
 * Use them to reference tools, eg. when customizing the catalog.
 * @example
 * getTools: ({ tools }) => tools.filter(tool => tool.name !== ToolNames.loadProjectData)
 */
export enum ToolNames {
  // Guide (guide.ts)
  getEditorGuide = 'get_editor_guide',

  // Editor (editor.ts)
  getEditorState = 'get_editor_state',
  getPageCode = 'get_page_code',
  getProjectData = 'get_project_data',
  loadProjectData = 'load_project_data',

  // Components (components.ts)
  getComponentTree = 'get_component_tree',
  getComponent = 'get_component',
  findComponents = 'find_components',
  listComponentTypes = 'list_component_types',
  selectComponents = 'select_components',
  addComponents = 'add_components',
  updateComponent = 'update_component',
  cloneComponent = 'clone_component',
  moveComponent = 'move_component',
  removeComponents = 'remove_components',
  setComponentStyle = 'set_component_style',
  updateComponentClasses = 'update_component_classes',

  // CSS rules (css.ts)
  getCssRules = 'get_css_rules',
  setCssRule = 'set_css_rule',
  removeCssRule = 'remove_css_rule',

  // Blocks (blocks.ts)
  listBlocks = 'list_blocks',
  getBlock = 'get_block',
  insertBlock = 'insert_block',

  // Traits (traits.ts)
  getComponentTraits = 'get_component_traits',
  updateComponentTraits = 'update_component_traits',

  // Pages (pages.ts)
  listPages = 'list_pages',
  addPage = 'add_page',
  renamePage = 'rename_page',
  selectPage = 'select_page',
  removePage = 'remove_page',

  // Devices (devices.ts)
  listDevices = 'list_devices',
  selectDevice = 'select_device',

  // Assets (assets.ts)
  listAssets = 'list_assets',
  addAssets = 'add_assets',
  removeAssets = 'remove_assets',

  // Undo manager (undo_manager.ts)
  undo = 'undo',
  redo = 'redo',
}
