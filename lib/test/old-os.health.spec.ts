import { Client } from '@opensearch-project/opensearch';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { getOSClientToken } from '../os.utils';
import { OldOSHealthIndicator } from '../health';
import { ConnectionMethod, OSModule, OS_HOST } from '../';

describe('Old health (spec)', () => {
  let module: TestingModule;
  let openSearchHealthIndicator: OldOSHealthIndicator;
  let osClient: Client;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [OSModule.forRoot({ host: OS_HOST, connectionMethod: ConnectionMethod.Local })],
      providers: [OldOSHealthIndicator],
    }).compile();

    openSearchHealthIndicator = module.get<OldOSHealthIndicator>(OldOSHealthIndicator);
    osClient = module.get<Client>(getOSClientToken());
  });

  it('Should throw HealthCheckError', async () => {
    const osClientCat = osClient.cat;
    jest.spyOn(osClientCat, 'health').mockImplementation(() => {
      throw new Error();
    });

    const connectionException = new HealthCheckError('Error while getting OpenSearch health', {
      opensearch: { status: 'down', message: 'Connection Error' },
    });

    await expect(openSearchHealthIndicator.isHealthy('opensearch')).rejects.toEqual(
      connectionException,
    );
  });

  it('Should return expected status up', async () => {
    const osClientCat = osClient.cat;
    jest.spyOn(osClientCat, 'health').mockImplementation();

    await expect(openSearchHealthIndicator.isHealthy('opensearch')).resolves.toEqual({
      opensearch: { status: 'up' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
