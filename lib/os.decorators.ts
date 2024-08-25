import { Inject } from '@nestjs/common';
import { getOSClientToken, getOSModuleOptionsToken } from './os.utils';

export const InjectOSModuleOptions = (): ReturnType<typeof Inject> => {
  return Inject(getOSModuleOptionsToken());
};

export const InjectOS = (): ReturnType<typeof Inject> => {
  return Inject(getOSClientToken());
};

export const InjectOSClient = InjectOS;
