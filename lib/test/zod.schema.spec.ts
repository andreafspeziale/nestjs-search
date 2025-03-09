import { fromZodError } from 'zod-validation-error';
import { buildOSSchemas } from '../zod';
import { ConnectionMethod, OS_HOST } from '../';

export const SERVICE_ACCOUNT_CONNECTION_PROPS = [
  'AWS_REGION',
  'AWS_ROLE_ARN',
  'AWS_WEB_IDENTITY_TOKEN_FILE',
] as const;

export const CREDENTIALS_CONNECTION_PROPS = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
] as const;

describe('Zod schema (spec)', () => {
  [
    {
      description: 'Should fail if OS_CONNECTION_METHOD is missing',
      scenarios: [
        {
          env: { OS_HOST: OS_HOST },
          expected: [
            {
              message:
                "Invalid discriminator value. Expected 'local' | 'proxy' | 'serviceAccount' | 'credentials'",
            },
          ],
        },
      ],
    },
    {
      description: 'Should fail if OS_CONNECTION_METHOD is something not mapped',
      scenarios: [
        {
          env: { OS_HOST: OS_HOST, OS_CONNECTION_METHOD: 'whatever' },
          expected: [
            {
              message:
                "Invalid discriminator value. Expected 'local' | 'proxy' | 'serviceAccount' | 'credentials'",
            },
          ],
        },
      ],
    },
    {
      description: `Should fail if OS_CONNECTION_METHOD ${ConnectionMethod.ServiceAccount} is not complete`,
      scenarios: [
        {
          env: { OS_HOST: OS_HOST, OS_CONNECTION_METHOD: ConnectionMethod.ServiceAccount },
          expected: [
            {
              path: [SERVICE_ACCOUNT_CONNECTION_PROPS[0]],
              message: 'Required',
            },
            {
              path: [SERVICE_ACCOUNT_CONNECTION_PROPS[1]],
              message: 'Required',
            },
            {
              path: [SERVICE_ACCOUNT_CONNECTION_PROPS[2]],
              message: 'Required',
            },
          ],
        },
      ],
    },
    {
      description: `Should fail if OS_CONNECTION_METHOD ${ConnectionMethod.Credentials} is not complete`,
      scenarios: [
        {
          env: { OS_HOST: OS_HOST, OS_CONNECTION_METHOD: ConnectionMethod.Credentials },
          expected: [
            {
              path: [CREDENTIALS_CONNECTION_PROPS[0]],
              message: 'Required',
            },
            {
              path: [CREDENTIALS_CONNECTION_PROPS[1]],
              message: 'Required',
            },
            {
              path: [CREDENTIALS_CONNECTION_PROPS[2]],
              message: 'Required',
            },
          ],
        },
      ],
    },
  ].forEach(({ description, scenarios }) =>
    scenarios.forEach(({ env, expected }) =>
      it(`${description}`, () => {
        const r = buildOSSchemas().osSchema.safeParse(env);
        expect(r.success).toBe(false);

        if (!r.success) {
          const { details } = fromZodError(r.error, {
            prefix: '',
            prefixSeparator: '',
          });

          expect(expected.length).toBe(details.length);
          details.forEach((e, i) => expect(e.message).toBe(expected[i]?.message));
        }
      }),
    ),
  );
});
