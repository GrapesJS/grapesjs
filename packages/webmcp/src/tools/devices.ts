import type { Device } from 'grapesjs';
import * as z from 'zod/mini';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import { createTool, ToolError } from '../utils';

export const serializeDevice = (device: Device) => ({
  id: device.id as string,
  name: device.getName(),
  width: device.getWidthMedia?.() || device.get('width') || '',
});

export default ({ editor }: WebMcpToolsContext) => [
  createTool({
    name: ToolNames.listDevices,
    title: 'List devices',
    description: 'List the configured devices (canvas sizes used for responsive styling).',
    annotations: { readOnlyHint: true },
    execute: () => {
      const selected = editor.Devices.getSelected();
      return {
        devices: editor.Devices.getAll().map((device) => ({
          ...serializeDevice(device),
          selected: device === selected,
        })),
      };
    },
  }),
  createTool({
    name: ToolNames.selectDevice,
    title: 'Select device',
    description:
      'Select a device to preview the canvas at its size. Styles set on components while a device is selected apply to its media query.',
    input: z.strictObject({ id: z.string().check(z.describe('Device id')) }),
    execute: ({ id }) => {
      const device = editor.Devices.get(id);
      if (!device) throw new ToolError(`Device "${id}" not found`, 'not_found');
      editor.Devices.select(device);
      return { device: serializeDevice(device) };
    },
  }),
];
