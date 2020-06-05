import NetworkDependency from './network';
import TraefikDependency from './traefik';

export default [
  new NetworkDependency(),
  new TraefikDependency(),
];
