import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PermissionAction } from '@prisma/client';
import { UserEntity } from 'src/common/entities/user.entity';


/**
 * Normal kullanıcı yetkileri: 
 * - Kendi kullanıcı bilgilerine erişim.
 * - Şirkete üyelik durumuna göre ilgili kaynaklarda (ör. DocumentEntity, CompanyEntity, vb.) erişim.
 */
export function defineUserAbilities(
  { can }: AbilityBuilder<PureAbility>,
  user: any,
): void {
  // Kendi kullanıcı bilgilerine erişim
  can(PermissionAction.READ, UserEntity, { id: user.id });
  can(PermissionAction.UPDATE, UserEntity, { id: user.id });

}