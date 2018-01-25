let Backbone = require('backbone')

module.exports = Backbone.View.extend({
  template: _.template(`
    <div class="<%= ppfx %>device-label"><%= deviceLabel %></div>
    <div class="<%= ppfx %>field <%= ppfx %>select">
      <span id="<%= ppfx %>input-holder">
        <select class="<%= ppfx %>devices"></select>
      </span>
      <div class="<%= ppfx %>sel-arrow">
        <div class="<%= ppfx %>d-s-arrow"></div>
      </div>
    </div>
    <button style="display:none" class="<%= ppfx %>add-trasp">+</button>`),

  events: {
    change: 'updateDevice',
  },

  initialize(o) {
    this.config = o.config || {}
    this.em = this.config.em
    this.ppfx = this.config.pStylePrefix || ''
    this.events['click .' + this.ppfx + 'add-trasp'] = this.startAdd
    this.listenTo(this.em, 'change:device', this.updateSelect)
    this.delegateEvents()
  },

  /**
   * Start adding new device
   * @return {[type]} [description]
   * @private
   */
  startAdd() {},

  /**
   * Update device of the editor
   * @private
   */
  updateDevice() {
    let em = this.em
    if (em) {
      let devEl = this.devicesEl
      let val = devEl ? devEl.val() : ''
      em.set('device', val)
    }
  },

  /**
   * Update select value on device update
   * @private
   */
  updateSelect() {
    let em = this.em
    let devEl = this.devicesEl
    if (em && em.getDeviceModel && devEl) {
      let device = em.getDeviceModel()
      let name = device ? device.get('name') : ''
      devEl.val(name)
    }
  },

  /**
   * Return devices options
   * @return {string} String of options
   * @private
   */
  getOptions() {
    let result = ''
    this.collection.each(device => {
      let name = device.get('name')
      result += '<option value="' + name + '">' + name + '</option>'
    })
    return result
  },

  render() {
    let pfx = this.ppfx
    this.$el.html(
      this.template({
        ppfx: pfx,
        deviceLabel: this.config.deviceLabel,
      })
    )
    this.devicesEl = this.$el.find('.' + pfx + 'devices')
    this.devicesEl.append(this.getOptions())
    this.el.className = pfx + 'devices-c'
    return this
  },
})
