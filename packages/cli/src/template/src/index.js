<% if(components){ %>import loadComponents from './components';<% } %>
<% if(blocks){ %>import loadBlocks from './blocks';<% } %>
<% if(i18n){ %>import en from './locale/en';<% } %>

export default (editor, opts = {}) => {
  const options = { ...{
    <% if(i18n){ %>i18n: {},<% } %>
    // default options
  },  ...opts };

  <% if(components){ %>// Add components
  loadComponents(editor, options);<% } %>
  <% if(blocks){ %>// Add blocks
  loadBlocks(editor, options);<% } %>
  <% if(i18n){ %>// Load i18n files
  editor.I18n && editor.I18n.addMessages({
      en,
      ...options.i18n,
  });<% } %>

  // TODO Remove
  editor.on('load', () =>
    editor.addComponents(
        `<div style="margin:100px; padding:25px;">
            Content loaded from the plugin
        </div>`,
        { at: 0 }
    ))
};
