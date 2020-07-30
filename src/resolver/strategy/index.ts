import RemoteResolver from './remote';
import LocalResolver from './local';

export default [
  new LocalResolver(),
  new RemoteResolver(),
];
