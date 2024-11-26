import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (status:boolean) => SetMetadata(IS_PUBLIC_KEY, status);