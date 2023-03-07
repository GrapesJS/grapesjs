import { DeviceProperties } from '../model/Device';

export interface DeviceManagerConfig {
  /**
   * The device `id` to select on start, if not indicated, the first available from `devices` will be used.
   * @default ''
   */
  default?: string;
  /**
   * Default devices.
   * @example
   * devices: [{
   *  id: 'desktop',
   *  name: 'Desktop',
   *  width: '',
   * }, {
   *  id: 'tablet',
   *  name: 'Tablet',
   *  width: '770px',
   *  widthMedia: '992px',
   * },
   * ...
   * ]
   */
  devices?: DeviceProperties[];
}

const config: DeviceManagerConfig = {
  default: '',
  devices: [
    {
      id: 'desktop',
      name: 'Desktop',
      width: '',
    },
    {
      id: 'tablet',
      name: 'Tablet',
      width: '770px',
      widthMedia: '992px',
    },
    {
      id: 'mobileLandscape',
      name: 'Mobile landscape',
      width: '568px',
      widthMedia: '768px',
    },
    {
      id: 'mobilePortrait',
      name: 'Mobile portrait',
      width: '320px',
      widthMedia: '480px',
    },
  ],
};

export default config;
