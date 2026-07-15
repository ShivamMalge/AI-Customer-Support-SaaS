import { Test, TestingModule } from '@nestjs/testing';
import { OrgsService } from './orgs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrgsService', () => {
  let service: OrgsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrgsService,
        {
          provide: PrismaService,
          useValue: {
            organization: { findUnique: jest.fn(), update: jest.fn() },
            user: { findFirst: jest.fn(), findMany: jest.fn(), delete: jest.fn() },
            role: { findFirst: jest.fn() },
            invite: { create: jest.fn() },
            userRole: { deleteMany: jest.fn(), create: jest.fn(), count: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<OrgsService>(OrgsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentOrg', () => {
    it('should fetch org scoped to orgId', async () => {
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue({ id: 'org1', name: 'Test Org' });
      const result = await service.getCurrentOrg('org1');
      expect(result.name).toBe('Test Org');
      expect(prisma.organization.findUnique).toHaveBeenCalledWith({ where: { id: 'org1' } });
    });

    it('should throw NotFoundException if org does not exist', async () => {
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getCurrentOrg('org1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrg', () => {
    it('should update org scoped to orgId', async () => {
      (prisma.organization.update as jest.Mock).mockResolvedValue({ id: 'org1', name: 'New Name' });
      const result = await service.updateOrg('org1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: 'org1' },
        data: { name: 'New Name' },
      });
    });
  });

  describe('createInvite', () => {
    it('should create an invite with token and expiry', async () => {
      (prisma.role.findFirst as jest.Mock).mockResolvedValue({ id: 'role1', orgId: 'org1' });
      (prisma.invite.create as jest.Mock).mockResolvedValue({ id: 'inv1', token: 'mockToken' });
      
      const result = await service.createInvite('org1', 'test@example.com', 'role1');
      expect(result.id).toBe('inv1');
      expect(prisma.invite.create).toHaveBeenCalled();
      
      const callArgs = (prisma.invite.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.token).toBeDefined();
      expect(callArgs.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('removeMember', () => {
    it('should remove non-owner member', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user1', roles: [{ role: { name: 'Member' } }] });
      (prisma.user.delete as jest.Mock).mockResolvedValue({ id: 'user1' });
      
      await service.removeMember('org1', 'user1');
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user1' } });
    });

    it('should throw BadRequestException when removing sole owner', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user1', roles: [{ role: { name: 'Owner' } }] });
      (prisma.userRole.count as jest.Mock).mockResolvedValue(1);
      
      await expect(service.removeMember('org1', 'user1')).rejects.toThrow(BadRequestException);
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should allow removing an owner if other owners exist', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user1', roles: [{ role: { name: 'Owner' } }] });
      (prisma.userRole.count as jest.Mock).mockResolvedValue(2);
      (prisma.user.delete as jest.Mock).mockResolvedValue({ id: 'user1' });
      
      await service.removeMember('org1', 'user1');
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user1' } });
    });
  });
});
