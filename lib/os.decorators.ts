import { Inject } from '@nestjs/common';
import { getOSClientToken } from './os.utils';

export const InjectOSClient = (): ReturnType<typeof Inject> => {
  return Inject(getOSClientToken());
};
