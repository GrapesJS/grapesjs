import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    // If true, triggers an 'active' event on dropped component
    activate: 0,
    // If true, the dropped component will be selected
    select: 0,
    // If true, all IDs of dropped component and its style will be changed
    resetId: 0,
    // Block label
    label: '',
    // Disable the drag of the block
    disable: 0,
    // HTML string for the media of the block, eg. SVG icon, image, etc.
    media: '',
    content: '',
    category: '',
    attributes: {}
  }
});
