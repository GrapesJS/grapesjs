import { Collection } from '../../common';
import Plugin from './Plugin';

export default class Plugins extends Collection<Plugin> {}

Plugins.prototype.model = Plugin;
