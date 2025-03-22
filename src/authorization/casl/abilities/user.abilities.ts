import { AbilityBuilder, PureAbility } from '@casl/ability';
import { CompanyRole, PermissionAction } from '@prisma/client';
import { DocumentEntity } from 'src/common/entities/document.entity';
import { CompanyEntity, CompanyMemberEntity } from 'src/common/entities/company.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { PermissionEntity } from 'src/common/entities/permissions.entity';
import { CompanyObjectEntity } from 'src/common/entities/object.entity';

/**
 * Normal kullanıcı yetkileri: 
 * - Kendi kullanıcı bilgilerine erişim.
 * - Şirkete üyelik durumuna göre ilgili kaynaklarda (ör. DocumentEntity, CompanyEntity, vb.) erişim.
 */
export function defineUserAbilities(
  { can }: AbilityBuilder<PureAbility>,
  user: any,
  companyMemberships: any[],
): void {
  // Kendi kullanıcı bilgilerine erişim
  can(PermissionAction.READ, UserEntity, { id: user.id });
  can(PermissionAction.UPDATE, UserEntity, { id: user.id });

  // Her bir şirket üyeliği için yetkilendirme
  for (const membership of companyMemberships) {
    if (membership.role === CompanyRole.OWNER) {
      // Owner: Şirkete ait tüm kaynakları yönetebilir.
      can(PermissionAction.MANAGE, CompanyEntity, { id: membership.companyId });
      can(PermissionAction.MANAGE, DocumentEntity, { companyId: membership.companyId });
      can(PermissionAction.MANAGE, CompanyMemberEntity, { companyId: membership.companyId });
      can(PermissionAction.MANAGE, PermissionEntity, { companyId: membership.companyId });
      can(PermissionAction.MANAGE, CompanyObjectEntity, { companyId: membership.companyId });
    } else if (membership.role === CompanyRole.OFFICER) {
      // Officer: Belge ve şirket üyesi işlemlerini yönetir.
      can(PermissionAction.MANAGE, DocumentEntity, { companyId: membership.companyId });
      can(PermissionAction.MANAGE, CompanyMemberEntity, { companyId: membership.companyId });
      can(PermissionAction.MANAGE, CompanyObjectEntity, { companyId: membership.companyId });

    } else if (membership.role === CompanyRole.MEMBER) {
      // Member: Sadece şirket belgelerini okuyabilir.
      can(PermissionAction.READ, DocumentEntity, { companyId: membership.companyId });
      can(PermissionAction.READ, CompanyObjectEntity, { companyId: membership.companyId });

    }
    
    // DB'den gelen özel izinleri uygula (varsa)
    for (const permission of membership.permission || []) {
      can(
        permission.action,
        permission.subject,
        permission.conditions || { companyId: membership.companyId }
      );
    }
  }
}