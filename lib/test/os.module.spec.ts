import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { getOSClientToken } from '../os.utils';
import { ConnectionMethod, OS_HOST, OS_PROXY_HOST, OSConfig, OSModule } from '../';
import { TestService } from './test.service';

interface Config extends OSConfig {
  someRandomConfigKey: string;
}

describe('Module and client load (spec)', () => {
  const scenarios: ({ description: string } & OSConfig)[] = [
    {
      description: `Config: ${ConnectionMethod.Local}`,
      os: {
        host: OS_HOST,
        connectionMethod: ConnectionMethod.Local,
      },
    },
    {
      description: `Config: ${ConnectionMethod.Proxy}`,
      os: {
        host: OS_PROXY_HOST,
        connectionMethod: ConnectionMethod.Proxy,
      },
    },
  ];

  scenarios.forEach(({ description, os }) =>
    describe(`${description}`, () => {
      let module: TestingModule;

      const returnConfig = (): Config => ({ os, someRandomConfigKey: 'someRandomConfigValue' });

      it('Should create the expected OpenSearchModule instance using forRoot', async () => {
        module = await Test.createTestingModule({
          imports: [OSModule.forRoot(os)],
        }).compile();

        const osModule = module.get<OSModule>(OSModule);
        const osClient = module.get<Client>(getOSClientToken());

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
              useFactory: (configService: ConfigService<Config, true>) => configService.get('os'),
              inject: [ConfigService],
            }),
          ],
        }).compile();

        const osModule = module.get<OSModule>(OSModule);
        const osClient = module.get<Client>(getOSClientToken());

        expect(osModule).toBeInstanceOf(OSModule);
        expect(osClient).toBeInstanceOf(Client);
      });

      it('Should be possible to access OSClient in another provider using register', async () => {
        module = await Test.createTestingModule({
          imports: [OSModule.register(os)],
          providers: [TestService],
        }).compile();

        const sampleService = module.get<TestService>(TestService);

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
              useFactory: (configService: ConfigService<Config, true>) => configService.get('os'),
              inject: [ConfigService],
            }),
          ],
          providers: [TestService],
        }).compile();

        const sampleService = module.get<TestService>(TestService);

        expect(sampleService).toBeInstanceOf(TestService);
        expect(sampleService.getConfig()).toEqual(os);
        expect(sampleService.getClient()).toBeInstanceOf(Client);
      });
    }),
  );
});
