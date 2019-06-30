import Backbone from 'backbone';
import Category from './Category';

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
    // HTML string for the media of the block, eg. SVG icon, image, etc.
    media: '',
    content: '',
    category: '',
    attributes: {}
  },

  initialize(opts = {}) {
    let category = this.get('category');

    if (category) {
      if (typeof category == 'string') {
        var catObj = new Category({
          id: category,
          label: category
        });
      }
    }
  }
});
