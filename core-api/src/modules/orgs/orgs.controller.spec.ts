import { Test, TestingModule } from '@nestjs/testing';
import { OrgsController } from './orgs.controller';
import { OrgsService } from './orgs.service';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('OrgsController', () => {
  let controller: OrgsController;
  let service: OrgsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgsController],
      providers: [
        {
          provide: OrgsService,
          useValue: {
            getCurrentOrg: jest.fn(),
            updateOrg: jest.fn(),
            createInvite: jest.fn(),
            getMembers: jest.fn(),
            updateMemberRole: jest.fn(),
            removeMember: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrgsController>(OrgsController);
    service = module.get<OrgsService>(OrgsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentOrg', () => {
    it('should call get current org', async () => {
      (service.getCurrentOrg as jest.Mock).mockResolvedValue({ id: 'org1' });
      const result = await controller.getCurrentOrg({ orgId: 'org1' });
      expect(result).toEqual({ id: 'org1' });
      expect(service.getCurrentOrg).toHaveBeenCalledWith('org1');
    });
  });

  describe('updateCurrentOrg', () => {
    it('should call update org', async () => {
      (service.updateOrg as jest.Mock).mockResolvedValue({ id: 'org1' });
      await controller.updateCurrentOrg({ orgId: 'org1' }, { name: 'Test' });
      expect(service.updateOrg).toHaveBeenCalledWith('org1', { name: 'Test' });
    });

    it('should have RolesGuard and Admin/Owner metadata', () => {
      const roles = Reflect.getMetadata('roles', controller.updateCurrentOrg);
      expect(roles).toEqual(['Admin', 'Owner']);
    });
  });

  describe('createInvite', () => {
    it('should create invite', async () => {
      (service.createInvite as jest.Mock).mockResolvedValue({ id: 'inv1' });
      await controller.createInvite({ orgId: 'org1' }, { email: 'a@b.com', roleId: 'role1' });
      expect(service.createInvite).toHaveBeenCalledWith('org1', 'a@b.com', 'role1');
    });

    it('should have RolesGuard and Admin/Owner metadata', () => {
      const roles = Reflect.getMetadata('roles', controller.createInvite);
      expect(roles).toEqual(['Admin', 'Owner']);
    });
  });

  describe('removeMember', () => {
    it('should remove member', async () => {
      (service.removeMember as jest.Mock).mockResolvedValue({ id: 'user1' });
      await controller.removeMember({ orgId: 'org1' }, 'user1');
      expect(service.removeMember).toHaveBeenCalledWith('org1', 'user1');
    });

    it('should have RolesGuard and Admin/Owner metadata', () => {
      const roles = Reflect.getMetadata('roles', controller.removeMember);
      expect(roles).toEqual(['Admin', 'Owner']);
    });
  });
});
