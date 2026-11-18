import { Repository } from 'typeorm';
import { User } from '../../database/entities/core.entity.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UserProfileDto } from './dto/user-profile.dto.js';
export declare class UsersService {
    private readonly users;
    constructor(users: Repository<User>);
    getAuthenticatedUser(userId: string): Promise<AuthenticatedUser>;
    getProfile(userId: string): Promise<UserProfileDto>;
    updateProfile(userId: string, input: UpdateProfileDto): Promise<UserProfileDto>;
    private toProfile;
}
