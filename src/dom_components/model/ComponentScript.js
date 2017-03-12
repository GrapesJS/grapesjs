define(['./Component'],
  function (Component) {

    return Component.extend({

      defaults: _.extend({}, Component.prototype.defaults, {
        type: 'script',
        droppable: false,
        draggable: false,
        hiddenLayer: true,
      }),

    }, {

      isComponent: function(el) {
        if (el.tagName == 'SCRIPT') {
          var result = {type: 'script'};

          if (el.src) {
            result.src = el.src;
            result.onload = el.onload;
          }

          return result;
        }
      },

    });
});
