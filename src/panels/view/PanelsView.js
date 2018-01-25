let Backbone = require('backbone')
let PanelView = require('./PanelView')

module.exports = Backbone.View.extend({
  initialize(o) {
    this.opt = o || {}
    this.config = this.opt.config || {}
    this.pfx = this.config.stylePrefix || ''
    this.listenTo(this.collection, 'add', this.addTo)
    this.listenTo(this.collection, 'reset', this.render)
    this.className = this.pfx + 'panels'
  },

  /**
   * Add to collection
   * @param Object Model
   *
   * @return Object
   * @private
   * */
  addTo(model) {
    this.addToCollection(model)
  },

  /**
   * Add new object to collection
   * @param  Object  Model
   * @param  Object   Fragment collection
   * @param  integer  Index of append
   *
   * @return Object Object created
   * @private
   * */
  addToCollection(model, fragmentEl) {
    let fragment = fragmentEl || null
    let view = new PanelView({
      model,
      config: this.config,
    })
    let rendered = view.render().el
    let appendTo = model.get('appendTo')

    if (appendTo) {
      let appendEl = document.querySelector(appendTo)
      appendEl.appendChild(rendered)
    } else {
      if (fragment) {
        fragment.appendChild(rendered)
      } else {
        this.$el.append(rendered)
      }
    }

    view.initResize()
    return rendered
  },

  render() {
    let fragment = document.createDocumentFragment()
    this.$el.empty()

    this.collection.each(function(model) {
      this.addToCollection(model, fragment)
    }, this)

    this.$el.append(fragment)
    this.$el.attr('class', this.className)
    return this
  },
})
