import { PrismaService } from '../prisma.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CreateUserDto, LoginDto, UpdateProfileDto } from './dto/user.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtStrategy);
    private hashPassword;
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
    getProfile(userId: string): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        role: any;
        profile: any;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<any>;
    getOnboardingStatus(userId: string): Promise<{
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
