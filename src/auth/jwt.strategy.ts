import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy {
  constructor(private readonly configService: ConfigService) {}

  getSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'immiassist-jwt-secret';
  }

  sign(payload: JwtPayload): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }),
    ).toString('base64url');
    const crypto = require('crypto');
    const signature = crypto.createHmac('sha256', this.getSecret()).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  verify(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const crypto = require('crypto');
      const expectedSig = crypto
        .createHmac('sha256', this.getSecret())
        .update(`${parts[0]}.${parts[1]}`)
        .digest('base64url');
      if (expectedSig !== parts[2]) return null;
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
      return { sub: payload.sub, email: payload.email, role: payload.role };
    } catch {
      return null;
    }
  }
}
