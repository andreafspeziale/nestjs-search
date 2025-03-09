import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { getOSClientToken } from '../os.utils';
import { ConnectionMethod, OS_HOST, OS_PROXY_HOST, OSConfig, OSModule } from '../';
import { TestService } from './test.service';

describe('Module and client load (spec)', () => {
  const scenarios: ({ description: string } & OSConfig)[] = [
    {
      description: `Config: ${ConnectionMethod.Local}`,
      os: {
        host: OS_HOST,
        connectionMethod: ConnectionMethod.Local,
        client: Client,
      },
    },
    {
      description: `Config: ${ConnectionMethod.Proxy}`,
      os: {
        host: OS_PROXY_HOST,
        connectionMethod: ConnectionMethod.Proxy,
        client: Client,
      },
    },
  ];

  scenarios.forEach(({ description, os }) =>
    describe(`${description}`, () => {
      let module: TestingModule;
      let app: INestApplication;

      const returnConfig = (): OSConfig => ({ os });

      it('Should create the expected OpenSearchModule instance using forRoot', async () => {
        module = await Test.createTestingModule({
          imports: [OSModule.forRoot(os)],
        }).compile();

        app = module.createNestApplication();
        await app.init();

        const osModule = app.get<OSModule>(OSModule);
        const osClient = app.get<Client>(getOSClientToken());

        expect(osModule).toBeInstanceOf(OSModule);
        expect(osClient).toBeInstanceOf(Client);
      });

      it('Should create the expected OpenSearchModule instance using forRootAsync', async () => {
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
        }).compile();

        app = module.createNestApplication();
        await app.init();

        const osModule = app.get<OSModule>(OSModule);
        const osClient = app.get<Client>(getOSClientToken());

        expect(osModule).toBeInstanceOf(OSModule);
        expect(osClient).toBeInstanceOf(Client);
      });

      it('Should be possible to access OSClient in another provider using register', async () => {
        module = await Test.createTestingModule({
          imports: [OSModule.register(os)],
          providers: [TestService],
        }).compile();

        app = module.createNestApplication();
        await app.init();

        const sampleService = app.get<TestService>(TestService);

        expect(sampleService).toBeInstanceOf(TestService);
        expect(sampleService.getConfig()).toEqual(os);
        expect(sampleService.getClient()).toBeInstanceOf(Client);
      });

      it('Should be possible to access OSClient in another provider using registerAsync', async () => {
        module = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [returnConfig],
            }),
            OSModule.registerAsync({
              useFactory: (configService: ConfigService<OSConfig, true>) => configService.get('os'),
              inject: [ConfigService],
            }),
          ],
          providers: [TestService],
        }).compile();

        app = module.createNestApplication();
        await app.init();

        const sampleService = app.get<TestService>(TestService);

        expect(sampleService).toBeInstanceOf(TestService);
        expect(sampleService.getConfig()).toEqual(os);
        expect(sampleService.getClient()).toBeInstanceOf(Client);
      });

      afterEach(async () => {
        await app.close();
      });
    }),
  );
});
