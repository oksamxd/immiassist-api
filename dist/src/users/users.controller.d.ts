import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, UpdateProfileDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(dto: CreateUserDto): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
        token: string;
    }>;
    getProfile(req: any): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        role: any;
        profile: any;
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<any>;
    getOnboardingStatus(req: any): Promise<{
        profileComplete: boolean;
        documents: {
            PASSPORT: any;
            VISA: any;
            I797: any;
            I20: any;
            EAD: any;
        };
        profile: {
            passportNumber: boolean;
            nationality: boolean;
            visaType: boolean;
            visaExpiry: boolean;
            employerOrUniversity: boolean;
        };
    }>;
}
