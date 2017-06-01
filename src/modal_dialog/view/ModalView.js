var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  template: _.template(`
    <div class="<%= pfx %>dialog">
      <div class="<%= pfx %>header">
        <div class="<%= pfx %>title"><%= title %></div>
        <div class="<%= pfx %>btn-close">&Cross;</div>
      </div>
      <div class="<%= pfx %>content">
        <div id="<%= pfx %>c"> <%= content %> </div>
        <div style="clear:both"></div>
      </div>
    </div>
    <div class="<%= pfx %>backlayer"></div>
    <div class="<%= pfx %>collector" style="display: none"></div>`),

  events: {},

  initialize(o) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.listenTo(this.model, 'change:open', this.updateOpen);
    this.listenTo(this.model, 'change:title', this.updateTitle);
    this.listenTo(this.model, 'change:content', this.updateContent);
    this.events['click .'+this.pfx+'btn-close']  = 'hide';

    if(this.config.backdrop)
      this.events['click .'+this.pfx+'backlayer'] = 'hide';

    this.delegateEvents();
  },

  /**
   * Returns collector element
   * @return {HTMLElement}
   * @private
   */
  getCollector() {
    if(!this.$collector)
      this.$collector = this.$el.find('.'+this.pfx+'collector');
    return this.$collector;
  },

  /**
   * Returns content element
   * @return {HTMLElement}
   * @private
   */
  getContent() {
    if(!this.$content)
      this.$content  = this.$el.find('.'+this.pfx+'content #'+this.pfx+'c');
    return this.$content;
  },

  /**
   * Returns title element
   * @return {HTMLElement}
   * @private
   */
  getTitle() {
    if(!this.$title)
      this.$title  = this.$el.find('.'+this.pfx+'title');
    return this.$title.get(0);
  },

  /**
   * Update content
   * @private
   * */
  updateContent() {
    var content = this.getContent();
    this.getCollector().append(content.children());
    content.html(this.model.get('content'));
  },

  /**
   * Update title
   * @private
   * */
  updateTitle() {
    var title = this.getTitle();
    if(title)
      title.innerHTML = this.model.get('title');
  },

  /**
   * Update open
   * @private
   * */
  updateOpen() {
    if(this.model.get('open'))
      this.$el.show();
    else
      this.$el.hide();
  },

  /**
   * Hide modal
   * @private
   * */
  hide() {
    this.model.set('open', 0);
  },

  /**
   * Show modal
   * @private
   * */
   show() {
    this.model.set('open', 1);
  },

  render() {
    var  obj = this.model.toJSON();
    obj.pfx = this.pfx;
    this.$el.html( this.template(obj) );
    this.$el.attr('class', this.pfx + 'container');
    this.updateOpen();
    return this;
  },

});
