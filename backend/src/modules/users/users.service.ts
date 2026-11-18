import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/core.entity.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UserProfileDto } from './dto/user-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async getAuthenticatedUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: { userRoles: { role: true } },
    });

    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return {
      id: user.id,
      displayName: user.displayName,
      roles: user.userRoles.map((assignment) => assignment.role.code),
    };
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: { userRoles: { role: true } },
    });

    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new NotFoundException('User profile was not found.');
    }

    return this.toProfile(user);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: { userRoles: { role: true } },
    });

    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new NotFoundException('User profile was not found.');
    }

    user.displayName = input.displayName;
    await this.users.save(user);
    return this.toProfile(user);
  }

  private toProfile(user: User): UserProfileDto {
    return {
      id: user.id,
      displayName: user.displayName,
      status: user.status,
      roles: user.userRoles.map((assignment) => assignment.role.code),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
