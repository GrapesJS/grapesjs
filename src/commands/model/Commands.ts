import { Collection } from '../../common';
import Command from './Command';

export default class Commands extends Collection<Command> {}

Commands.prototype.model = Command;
