var Backbone = require('backbone');
var ComponentView = require('dom_components/view/ComponentView');
var ItemsView;

module.exports = Backbone.View.extend({

  events: {
    'mousedown [data-toggle-move]': 'startSort',
    'click [data-toggle-visible]': 'toggleVisibility',
    'click [data-toggle-select]': 'handleSelect',
    'click [data-toggle-open]': 'toggleOpening',
    'click [data-toggle-edit]': 'handleEdit',
    'focusout input': 'handleEditEnd',
  },

  template: _.template(`
  <% if (hidable) { %>
    <i id="<%= prefix %>btn-eye" class="btn fa fa-eye <%= (visible ? '' : 'fa-eye-slash') %>" data-toggle-visible></i>
  <% } %>

  <div class="<%= prefix %>title-c">
    <div class="<%= prefix %>title <%= addClass %>" style="padding-left: <%= 42 + level * 10 %>px" data-toggle-select>
      <div class="<%= prefix %>title-inn">
        <i class="fa fa-pencil <%= editBtnCls %>" data-toggle-edit></i>
        <i id="<%= prefix %>caret" class="fa fa-chevron-right <%= caretCls %>" data-toggle-open></i>
        <%= icon %>
        <input class="<%= ppfx %>no-app <%= inputNameCls %>" value="<%= title %>" readonly>
      </div>
    </div>
  </div>

  <div id="<%= prefix %>counter"><%= (count ? count : '') %></div>

  <div id="<%= prefix %>move" data-toggle-move>
    <i class="fa fa-arrows"></i>
  </div>

  <div class="<%= prefix %>children"></div>`),

  initialize(o = {}) {
    this.opt = o;
    this.level = o.level;
    this.config = o.config;
    this.em = o.config.em;
    this.ppfx = this.em.get('Config').stylePrefix;
    this.sorter = o.sorter || '';
    this.pfx = this.config.stylePrefix;
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const model = this.model;
    const components = model.get('components');
    model.set('open', false);
    this.listenTo(components, 'remove add change reset', this.checkChildren);
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change:status', this.updateStatus);
    this.listenTo(model, 'change:open', this.updateOpening);
    this.className = `${pfx}item no-select`;
    this.editBtnCls = `${pfx}nav-item-edit`;
    this.inputNameCls = `${ppfx}nav-comp-name`;
    this.caretCls = `${ppfx}nav-item-caret`;
    this.titleCls = `${pfx}title`;
    this.$el.data('model', model);
    this.$el.data('collection', components);
  },

  /**
   * Handle the edit of the component name
   */
  handleEdit(e) {
    e.stopPropagation();
    var inputName = this.getInputName();
    inputName.readOnly = false;
    inputName.focus();
  },

  /**
   * Handle with the end of editing of the component name
   */
  handleEditEnd(e) {
    e.stopPropagation();
    var inputName = this.getInputName();
    inputName.readOnly = true;
    this.model.set('custom-name', inputName.value);
  },

  /**
   * Get the input containing the name of the component
   * @return {HTMLElement}
   */
  getInputName() {
    if(!this.inputName) {
      this.inputName = this.el.querySelector('.' + this.inputNameCls);
    }
    return this.inputName;
  },

  /**
   * Update item opening
   *
   * @return void
   * */
  updateOpening() {
    var opened = this.opt.opened || {};
    var model = this.model;
    const chvDown = 'fa-chevron-down';

    if (model.get('open')) {
      this.$el.addClass('open');
      this.getCaret().addClass(chvDown);
      opened[model.cid] = model;
    } else {
      this.$el.removeClass("open");
      this.getCaret().removeClass(chvDown);
      delete opened[model.cid];
    }
  },

  /**
   * Toggle item opening
   * @param {Object}	e
   *
   * @return void
   * */
  toggleOpening(e) {
    e.stopPropagation();

    if(!this.model.get('components').length)
      return;

    this.model.set('open', !this.model.get('open') );
  },

  /**
   * Handle component selection
   */
  handleSelect(e) {
    e.stopPropagation();
    this.em && this.em.setSelected(this.model, {fromLayers: 1});
  },

  /**
   * Delegate to sorter
   * @param	Event
   * */
  startSort(e) {
    e.stopPropagation();

    //Right or middel click
    if (e.button !== 0) {
      return;
    }

    this.sorter && this.sorter.startSort(e.target);
  },

  /**
   * Freeze item
   * @return	void
   * */
  freeze() {
    this.$el.addClass(this.pfx + 'opac50');
    this.model.set('open',0);
  },

  /**
   * Unfreeze item
   * @return	void
   * */
  unfreeze() {
    this.$el.removeClass(this.pfx + 'opac50');
  },

  /**
   * Update item on status change
   * @param	Event
   * */
  updateStatus(e) {
    ComponentView.prototype.updateStatus.apply(this, arguments);
  },

  /**
   * Toggle visibility
   * @param	Event
   *
   * @return 	void
   * */
  toggleVisibility(e) {
    e.stopPropagation();
    const pfx = this.pfx;

    if(!this.$eye)
      this.$eye = this.$el.children(`#${pfx}btn-eye`);

    var cCss = _.clone(this.model.get('style')),
    hClass = this.pfx + 'hide';
    if(this.isVisible()){
      this.$el.addClass(hClass);
      this.$eye.addClass('fa-eye-slash');
      cCss.display = 'none';
    }else{
      this.$el.removeClass(hClass);
      this.$eye.removeClass('fa-eye-slash');
      delete cCss.display;
    }
    this.model.set('style', cCss);
  },

  /**
   * Check if component is visible
   *
   * @return bool
   * */
  isVisible() {
    var css = this.model.get('style'),
      pr = css.display;
    if(pr && pr == 'none' )
      return;
    return 1;
  },

  /**
   * Update item aspect after children changes
   *
   * @return void
   * */
  checkChildren() {
    const model = this.model;
    const c = this.countChildren(model);
    const pfx = this.pfx;
    const noChildCls = `${pfx}no-chld`;
    const title = this.$el.children(`.${pfx}title-c`).children(`.${pfx}title`);
    //tC = `> .${pfx}title-c > .${pfx}title`;
    if (!this.$counter) {
      this.$counter	= this.$el.children(`#${pfx}counter`);
    }

    if (c) {
      title.removeClass(noChildCls);
      this.$counter.html(c);
    } else {
      title.addClass(noChildCls);
      this.$counter.empty();
      model.set('open', 0);
    }
  },

  /**
   * Count children inside model
   * @param  {Object} model
   * @return {number}
   * @private
   */
  countChildren(model) {
    var count = 0;
    model.get('components').each(function(m){
      var isCountable = this.opt.isCountable;
      var hide = this.config.hideTextnode;
      if(isCountable && !isCountable(m, hide))
        return;
      count++;
    }, this);
    return count;
  },

  getCaret() {
    if (!this.caret) {
      const pfx = this.pfx;
      this.caret = this.$el.children(`.${pfx}title-c`).find(`#${pfx}caret`);
    }

    return this.caret;
  },

  render() {
    let model = this.model;
    var pfx = this.pfx;
    var vis = this.isVisible();
    var count = this.countChildren(model);
    const el = this.$el;
    const level = this.level + 1;

    el.html( this.template({
      title: model.getName(),
      icon: model.getIcon(),
      addClass: (count ? '' : pfx+'no-chld'),
      editBtnCls: this.editBtnCls,
      inputNameCls: this.inputNameCls,
      caretCls: this.caretCls,
      count,
      visible: vis,
      hidable: this.config.hidable,
      prefix: pfx,
      ppfx: this.ppfx,
      level
    }));

    if (typeof ItemsView == 'undefined') {
      ItemsView = require('./ItemsView');
    }

    const children = new ItemsView({
      collection: model.get('components'),
      config: this.config,
      sorter: this.sorter,
      opened: this.opt.opened,
      parent: model,
      level
    }).render().$el;
    el.find(`.${pfx}children`).append(children);

    if(!model.get('draggable') || !this.config.sortable) {
    	el.children(`#${pfx}move`).remove();
    }

    if(!vis)
      this.className += ' ' + pfx + 'hide';
    el.attr('class', _.result(this, 'className'));
    this.updateOpening();
    this.updateStatus();
    return this;
  },

});
