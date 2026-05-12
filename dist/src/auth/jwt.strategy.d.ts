import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
export declare class JwtStrategy {
    private readonly configService;
    constructor(configService: ConfigService);
    getSecret(): string;
    sign(payload: JwtPayload): string;
    verify(token: string): JwtPayload | null;
}
