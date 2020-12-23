import { parse } from 'yaml';
import * as Joi from 'joi';
import { ServiceConfig } from '../types';

export default class ConfigParser {
  private schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    dependencies: Joi.array().items(Joi.string()),
    optionalDependencies: Joi.array().items(Joi.string()),
    routes: Joi.array().items(Joi.object({
      host: Joi.string().required(),
      port: Joi.number().required(),
    })),
    instructions: Joi.array().items(Joi.string()),
    credentials: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
    }).pattern(Joi.string(), Joi.string())),
    setup: Joi.array().items(Joi.string()),
    start: Joi.array().items(Joi.string()),
    stop: Joi.array().items(Joi.string()),
    test: Joi.array().items(Joi.string()),
  });

  public parse(content: string): ServiceConfig {
    const config = parse(content);
    const result = this.schema.validate(config);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return config as ServiceConfig;
  }
}
