import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { InjectOSClient } from '../';

@Injectable()
export class TestService {
  constructor(@InjectOSClient() private readonly osClient: Client) {}

  getClient(): Client {
    return this.osClient;
  }
}
