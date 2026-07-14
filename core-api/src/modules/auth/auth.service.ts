import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Create organization, role, and user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create org
      const org = await tx.organization.create({
        data: {
          name: dto.orgName,
          slug: dto.orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
        },
      });

      // 2. Create Owner role
      const ownerRole = await tx.role.create({
        data: {
          orgId: org.id,
          name: 'Owner',
          isSystemRole: true,
        },
      });

      // 3. Create User
      const user = await tx.user.create({
        data: {
          orgId: org.id,
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
        },
      });

      // 4. Assign role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: ownerRole.id,
        },
      });

      return { user, org, ownerRole };
    });

    return this.login({ email: dto.email, password: dto.password });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.roles.map(ur => ur.role.name);
    const payload = { sub: user.id, email: user.email, orgId: user.orgId, roles };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        orgId: user.orgId,
        roles,
      },
    };
  }
}
