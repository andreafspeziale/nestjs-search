import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectOSClient } from '../os.decorators';

@Injectable()
export class OSHealthIndicator extends HealthIndicator {
  constructor(@InjectOSClient() private readonly osClient: Client) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.osClient.cat.health();
    } catch (e) {
      throw new HealthCheckError(
        'Error while getting OpenSearch health',
        this.getStatus(key, false, {
          message: (e as Error).message,
        }),
      );
    }

    return this.getStatus(key, true);
  }
}
