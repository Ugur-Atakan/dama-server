// src/authorization/casl/ability.factory.ts
import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
  mongoQueryMatcher,
} from '@casl/ability';
import { User } from '@prisma/client';
import { PermissionAction } from '@prisma/client';
import { DocumentEntity } from 'src/common/entities/document.entity';
import {
  CompanyEntity,
  CompanyMemberEntity,
} from 'src/common/entities/company.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { PermissionEntity } from 'src/common/entities/permissions.entity';
import { PrismaService } from 'src/prisma.service';
import { Role } from 'src/common/enums/role.enum';
import { defineAdminAbilities } from './abilities/admin.abilities';
import { defineUserAbilities } from './abilities/user.abilities';
import { CompanyObjectEntity } from 'src/common/entities/object.entity';

// Define subjects that permissions can target
export type Subjects = InferSubjects<
  | typeof DocumentEntity
  | typeof CompanyEntity
  | typeof UserEntity
  | typeof CompanyMemberEntity
  | typeof PermissionEntity
  | typeof CompanyObjectEntity
  | 'all'
>;

// Define AppAbility type
export type AppAbility = PureAbility<[PermissionAction, Subjects]>;

// Define CaslAbilityFactory
@Injectable()
export class CaslAbilityFactory {
  constructor(private prismaService: PrismaService) {}

  async createForUser(user: User): Promise<AppAbility> {
    // Get user roles and company memberships with a single query
    const userWithRolesAndMemberships =
      await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          roles: true,
          companies: {
            include: {
              permission: true,
            },
          },
        },
      });

    // Get user roles
    const userRoles = userWithRolesAndMemberships.roles.map((ur) => ur.role);
    // Get user company memberships
    const companyMemberships = userWithRolesAndMemberships.companies;

    const abilityBuilder = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    const { can, cannot, build } = abilityBuilder;

    if (userRoles.includes('ADMIN')) {
      defineAdminAbilities(abilityBuilder);
    }
    if (userRoles.includes(Role.USER)) {
      defineUserAbilities(abilityBuilder, user, companyMemberships);
    }

    return build({
      // Nesne tipini algılama
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
      resolveAction: (action) => {
        if (action === PermissionAction.MANAGE) {
          return [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
          ];
        }
        return action;
      },
      conditionsMatcher: mongoQueryMatcher,
    });
  }
}
