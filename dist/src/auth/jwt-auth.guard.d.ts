import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtStrategy;
    constructor(jwtStrategy: JwtStrategy);
    canActivate(context: ExecutionContext): boolean;
}
