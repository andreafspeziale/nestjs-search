import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { InjectOS } from '../os.decorators';

@Injectable()
export class OSHealthIndicator {
  constructor(
    @InjectOS() private readonly osClient: Client,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.osClient.cat.health();
    } catch (e) {
      return indicator.down({
        message: (e as Error).message,
      });
    }

    return indicator.up();
  }
}
