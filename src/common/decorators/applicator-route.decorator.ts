import { SetMetadata } from '@nestjs/common';

export const IS_APPLICATOR_ROUTE_KEY = 'isApplicatorRoute';
export const ApplicatorRoute = () => SetMetadata(IS_APPLICATOR_ROUTE_KEY, true);