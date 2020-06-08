import RegistryResolver from './registry';
import LocalResolver from './local';

export default [
  new RegistryResolver(),
  new LocalResolver(),
];
