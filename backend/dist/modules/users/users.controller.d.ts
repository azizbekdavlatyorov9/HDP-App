import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyProfile(user: AuthenticatedUser): Promise<import("./dto/user-profile.dto.js").UserProfileDto>;
    updateMyProfile(user: AuthenticatedUser, input: UpdateProfileDto): Promise<import("./dto/user-profile.dto.js").UserProfileDto>;
}
