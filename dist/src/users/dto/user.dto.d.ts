export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class UpdateProfileDto {
    passportNumber?: string;
    nationality?: string;
    visaType?: string;
    visaExpiry?: string;
    employerOrUniversity?: string;
    portOfEntry?: string;
    preferredLanguage?: string;
    emergencyContact?: string;
}
