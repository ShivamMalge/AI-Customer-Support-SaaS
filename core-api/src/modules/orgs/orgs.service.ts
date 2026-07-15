import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class OrgsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentOrg(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async updateOrg(orgId: string, data: { name?: string; slug?: string; logoUrl?: string; timezone?: string }) {
    try {
      return await this.prisma.organization.update({
        where: { id: orgId },
        data,
      });
    } catch (error) {
      throw new NotFoundException('Organization not found');
    }
  }

  async createInvite(orgId: string, email: string, roleId: string) {
    // Basic verification that the role exists and belongs to the org
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, orgId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.invite.create({
      data: {
        orgId,
        email,
        roleId,
        token,
        expiresAt,
      },
    });
  }

  async getMembers(orgId: string) {
    const users = await this.prisma.user.findMany({
      where: { orgId },
      select: {
        id: true,
        email: true,
        fullName: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      roles: u.roles.map(r => r.role),
    }));
  }

  async updateMemberRole(orgId: string, userId: string, roleId: string) {
    // Verify the user belongs to the org
    const user = await this.prisma.user.findFirst({
      where: { id: userId, orgId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Verify the role belongs to the org
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, orgId },
    });
    if (!role) throw new NotFoundException('Role not found');

    // Remove existing roles
    await this.prisma.userRole.deleteMany({
      where: { userId },
    });

    // Assign new role
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async removeMember(orgId: string, userId: string) {
    // Verify the user belongs to the org
    const user = await this.prisma.user.findFirst({
      where: { id: userId, orgId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const isOwner = user.roles.some(r => r.role.name === 'Owner');
    if (isOwner) {
      // Check if there are other owners
      const allOwnersCount = await this.prisma.userRole.count({
        where: {
          role: { name: 'Owner', orgId },
          user: { orgId },
        },
      });

      if (allOwnersCount <= 1) {
        throw new BadRequestException('Cannot remove the sole owner of the organization');
      }
    }

    // Delete user
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
