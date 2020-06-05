/* eslint-disable import/prefer-default-export */
import * as path from 'path';
import { ServiceDefinition } from '../types';
import Config from '../config';

export const resolveRepositoryPath = (service: ServiceDefinition) => {
  const url = new URL(service.url);
  return path.resolve(Config.getWorkspacePath(), url.host, service.name);
};
