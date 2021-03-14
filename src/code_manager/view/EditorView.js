import { template } from 'underscore';
import Backbone from 'backbone';

export default class EditorView extends Backbone.View {
    initialize(o) {
        this.config = o.config || {};
        this.pfx = this.config.stylePrefix;
    }

    render() {
        var obj = this.model.toJSON();
        obj.pfx = this.pfx;
        this.$el.html(this.template(obj));
        this.$el.attr('class', this.pfx + 'editor-c');
        this.$el.find('#' + this.pfx + 'code').append(this.model.get('input'));
        return this;
    }
}
EditorView.prototype.template = template(`
  <div class="<%= pfx %>editor" id="<%= pfx %><%= codeName %>">
  	<div id="<%= pfx %>title"><%= label %></div>
  	<div id="<%= pfx %>code"></div>
  </div>`);
