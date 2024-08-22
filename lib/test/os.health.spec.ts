import { INestApplication } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { getOSClientToken } from '../os.utils';
import { OSHealthIndicator } from '../health';
import { ConnectionMethod, OSConfig, OSModule, OS_HOST } from '../';

describe('Health', () => {
  let module: TestingModule;
  let app: INestApplication;
  let openSearchHealthIndicator: OSHealthIndicator;
  let osClient: Client;

  const returnConfig = (): OSConfig => ({
    os: { host: OS_HOST, connectionMethod: ConnectionMethod.Local, client: Client },
  });

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [returnConfig],
        }),
        OSModule.forRootAsync({
          useFactory: (configService: ConfigService<OSConfig, true>) => configService.get('os'),
          inject: [ConfigService],
        }),
      ],
      providers: [OSHealthIndicator],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    openSearchHealthIndicator = app.get<OSHealthIndicator>(OSHealthIndicator);
    osClient = app.get<Client>(getOSClientToken());
  });

  it('Should throw HealthCheckError', async () => {
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

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });
});
