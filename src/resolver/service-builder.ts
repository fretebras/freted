import { ComposeFile, ServiceDefinition, Repository } from '../types';
import ComposeFileParser from './parsers/compose';
import ReadmeFileParser from './parsers/readme';

export default class ServiceDefinitionBuilder {
  private composeFileParser = new ComposeFileParser();

  private readmeFileParser = new ReadmeFileParser();

  private name: string;

  private localPath: string;

  private repository?: Repository;

  private composeFile?: ComposeFile;

  private readmeFile?: string;

  constructor(serviceName: string, localPath: string) {
    this.name = serviceName;
    this.localPath = localPath;
  }

  static new(name: string, localPath: string) {
    return new ServiceDefinitionBuilder(name, localPath);
  }

  public setRepository(repository: Repository) {
    this.repository = repository;
    return this;
  }

  public setComposeFile(composeFile: ComposeFile) {
    this.composeFile = composeFile;
    return this;
  }

  public setReadmeFile(readmeFile?: string) {
    this.readmeFile = readmeFile;
    return this;
  }

  public build(): ServiceDefinition {
    const service: Partial<ServiceDefinition> = {
      name: this.name,
      localPath: this.localPath,
      repository: this.repository,
    };

    if (this.composeFile) {
      Object.assign(service, this.composeFileParser.parse(this.composeFile));
    }

    if (this.readmeFile) {
      Object.assign(service, this.readmeFileParser.parse(this.readmeFile));
    }

    return service as ServiceDefinition;
  }
}
