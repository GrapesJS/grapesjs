import { Collection } from '../../common';
import ToolbarButton from './ToolbarButton';

export default class Toolbar extends Collection<ToolbarButton> {}

Toolbar.prototype.model = ToolbarButton;
