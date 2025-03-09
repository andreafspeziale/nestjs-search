import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { InjectOS, type OSModuleOptions, InjectOSModuleOptions } from '../';

@Injectable()
export class TestService {
  constructor(
    @InjectOSModuleOptions() private readonly osModuleOptions: OSModuleOptions,
    @InjectOS() private readonly osClient: Client,
  ) {}

  getConfig(): OSModuleOptions {
    return this.osModuleOptions;
  }

  getClient(): Client {
    return this.osClient;
  }
}
