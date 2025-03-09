import { Client } from '@opensearch-project/opensearch';
import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { getOSClientToken } from '../os.utils';
import { OSHealthIndicator } from '../health';
import { ConnectionMethod, OSModule, OS_HOST } from '../';

describe('Health (spec)', () => {
  let module: TestingModule;
  let openSearchHealthIndicator: OSHealthIndicator;
  let osClient: Client;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        OSModule.forRoot({ host: OS_HOST, connectionMethod: ConnectionMethod.Local }),
        TerminusModule,
      ],
      providers: [OSHealthIndicator],
    }).compile();

    openSearchHealthIndicator = module.get<OSHealthIndicator>(OSHealthIndicator);
    osClient = module.get<Client>(getOSClientToken());
  });

  it('Should throw HealthCheckError', async () => {
    const message = 'Connection Error';
    const osClientCat = osClient.cat;
    jest.spyOn(osClientCat, 'health').mockImplementation(() => {
      throw new Error(message);
    });

    const expected = { opensearch: { status: 'down', message: message } };
    const received = await openSearchHealthIndicator.isHealthy('opensearch');

    expect(received).toStrictEqual(expected);
  });

  it('Should return expected status up', async () => {
    const osClientCat = osClient.cat;
    jest.spyOn(osClientCat, 'health').mockImplementation();

    const expected = { opensearch: { status: 'up' } };
    const received = await openSearchHealthIndicator.isHealthy('opensearch');

    expect(received).toStrictEqual(expected);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
