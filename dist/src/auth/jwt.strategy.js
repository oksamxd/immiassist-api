"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let JwtStrategy = class JwtStrategy {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    getSecret() {
        return this.configService.get('JWT_SECRET') || 'immiassist-jwt-secret';
    }
    sign(payload) {
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
        const crypto = require('crypto');
        const signature = crypto.createHmac('sha256', this.getSecret()).update(`${header}.${body}`).digest('base64url');
        return `${header}.${body}.${signature}`;
    }
    verify(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3)
                return null;
            const crypto = require('crypto');
            const expectedSig = crypto
                .createHmac('sha256', this.getSecret())
                .update(`${parts[0]}.${parts[1]}`)
                .digest('base64url');
            if (expectedSig !== parts[2])
                return null;
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000))
                return null;
            return { sub: payload.sub, email: payload.email, role: payload.role };
        }
        catch {
            return null;
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map