import { Collection } from '../../common';
import Panel from './Panel';

export default class Panels extends Collection<Panel> {}

Panels.prototype.model = Panel;
