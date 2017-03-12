define(['backbone', './ComponentImageView'],
  function (Backbone, ComponentView) {

  return ComponentView.extend({

    tagName: 'script',

    events: {},

    render: function() {
      var model = this.model;
      var src = model.get('src');
      var content = '';

      // If it's an external script
      if(src) {
        content = "var script = document.createElement('script');" +
          "script.onload = " + model.get('onload') + ";" +
          "script.src = '" + src + "';"+
          "document.body.appendChild(script);";
      } else {
        content = model.get('content');
      }

      this.el.innerHTML = content;
      return this;
    },

  });
});
