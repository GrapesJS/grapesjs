import { extend } from 'underscore';
import Backbone from 'backbone';

export default Backbone.Model.extend({
  mapModel(model) {
    var code = '';
    var script = model.get('script-export') || model.get('script');
    var type = model.get('type');
    var comps = model.get('components');
    var id = model.getId();

    if (script) {
      // If the component has scripts we need to expose his ID
      var attr = model.get('attributes');
      attr = extend({}, attr, { id });
      model.set('attributes', attr, { silent: 1 });
      var scrStr = model.getScriptString(script);

      // If the script was updated, I'll put its code in a separate container
      if (model.get('scriptUpdated')) {
        this.mapJs[type + '-' + id] = { ids: [id], code: scrStr };
      } else {
        var mapType = this.mapJs[type];

        if (mapType) {
          mapType.ids.push(id);
        } else {
          this.mapJs[type] = { ids: [id], code: scrStr };
        }
      }
    }

    comps.each(function(model) {
      code += this.mapModel(model);
    }, this);

    return code;
  },

  build(model) {
    this.mapJs = {};
    this.mapModel(model);

    var code = '';

    for (var type in this.mapJs) {
      var mapType = this.mapJs[type];
      var ids = '#' + mapType.ids.join(', #');
      code += `
        var items = document.querySelectorAll('${ids}');
        for (var i = 0, len = items.length; i < len; i++) {
          (function(){${mapType.code}}.bind(items[i]))();
        }`;
    }

    return code;
  }
});
