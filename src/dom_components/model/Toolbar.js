import Backbone from 'backbone';
import ToolbarButton from './ToolbarButton';

export default class Toolbar extends Backbone.Collection {
}
Toolbar.prototype.model = ToolbarButton;
