let Backbone = require('backbone')

module.exports = Backbone.Model.extend({
  mapModel(model) {
    let code = ''
    let script = model.get('script')
    let type = model.get('type')
    let comps = model.get('components')
    let id = model.getId()

    if (script) {
      // If the component has scripts we need to expose his ID
      let attr = model.get('attributes')
      attr = _.extend({}, attr, { id })
      model.set('attributes', attr)
      let scrStr = model.getScriptString()

      // If the script was updated, I'll put its code in a separate container
      if (model.get('scriptUpdated')) {
        this.mapJs[type + '-' + id] = { ids: [id], code: scrStr }
      } else {
        let mapType = this.mapJs[type]

        if (mapType) {
          mapType.ids.push(id)
        } else {
          this.mapJs[type] = { ids: [id], code: scrStr }
        }
      }
    }

    comps.each(function(model) {
      code += this.mapModel(model)
    }, this)

    return code
  },

  build(model) {
    this.mapJs = {}
    this.mapModel(model)

    let code = ''

    for (let type in this.mapJs) {
      let mapType = this.mapJs[type]
      let ids = '#' + mapType.ids.join(', #')
      code += `
        var items = document.querySelectorAll('${ids}');
        for (var i = 0, len = items.length; i < len; i++) {
          (function(){${mapType.code}}.bind(items[i]))();
        }`
    }

    return code
  },
})
