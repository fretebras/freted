import RepositoryResolver from './repository';
import LocalResolver from './local';

export default [
  new RepositoryResolver(),
  new LocalResolver(),
];
