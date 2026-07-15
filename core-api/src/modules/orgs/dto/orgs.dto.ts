import { IsString, IsOptional, IsUrl, IsEmail, IsUUID } from 'class-validator';

export class UpdateOrgDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsUUID()
  roleId: string;
}

export class UpdateMemberRoleDto {
  @IsUUID()
  roleId: string;
}
