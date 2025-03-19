import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectOS } from '../os.decorators';

@Injectable()
/**
 * @deprecated
 * **This class has been deprecated and will be removed in the next NestJS major release.**
 * Instead utilise the `OSHealthIndicator` to indicate the health of your health indicator.
 *
 * @see {@link https://docs.nestjs.com/migration-guide#terminus-module|Migration Guide}
 */
export class OldOSHealthIndicator extends HealthIndicator {
  constructor(@InjectOS() private readonly osClient: Client) {
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
