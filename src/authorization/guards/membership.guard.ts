import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { RoleType } from '@prisma/client';

@Injectable()
export class CompanyMembershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const companyId = request.params.companyId;
    const currentUser = request.user;

    if(currentUser.roles.some(role => role === RoleType.ADMIN|| role === RoleType.SUPERADMIN)) {
      return true;
    }else if (!currentUser.companies || !currentUser.companies.some(membership => membership.companyId === companyId)) {
      throw new ForbiddenException('You are not a allowed to access this resource');
    }
    return true;
  }
}