import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateOrgDto, CreateInviteDto, UpdateMemberRoleDto } from './dto/orgs.dto';

@UseGuards(JwtAuthGuard)
@Controller('orgs')
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Get('current')
  async getCurrentOrg(@CurrentUser() user: any) {
    return this.orgsService.getCurrentOrg(user.orgId);
  }

  @Patch('current')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Owner')
  async updateCurrentOrg(
    @CurrentUser() user: any,
    @Body() dto: UpdateOrgDto,
  ) {
    return this.orgsService.updateOrg(user.orgId, dto);
  }

  @Post('invites')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Owner')
  async createInvite(
    @CurrentUser() user: any,
    @Body() dto: CreateInviteDto,
  ) {
    return this.orgsService.createInvite(user.orgId, dto.email, dto.roleId);
  }

  @Get('members')
  async getMembers(@CurrentUser() user: any) {
    return this.orgsService.getMembers(user.orgId);
  }

  @Patch('members/:userId/role')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Owner')
  async updateMemberRole(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.orgsService.updateMemberRole(user.orgId, userId, dto.roleId);
  }

  @Delete('members/:userId')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Owner')
  async removeMember(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    return this.orgsService.removeMember(user.orgId, userId);
  }
}
