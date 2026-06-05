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
    preferredLanguage?: string;
    emergencyContact?: string;
    countryOfResidence?: string;
    travelHistory?: any;
    currentVisaStatus?: string;
    visaExpiry?: string;
    immigrationHistory?: any;
    previousNotices?: any;
    previousDenials?: any;
    currentEmployer?: string;
    university?: string;
    dependents?: any;
}
