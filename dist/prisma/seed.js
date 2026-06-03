"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
async function main() {
    console.log('🌱 Seeding ImmiAssist database...');
    const supportUser = await prisma.user.upsert({
        where: { email: 'support@immiassist.com' },
        update: {},
        create: {
            name: 'Alex Support',
            email: 'support@immiassist.com',
            passwordHash: hashPassword('password123'),
            role: 'SUPPORT',
        },
    });
    await prisma.supportAgent.upsert({
        where: { userId: supportUser.id },
        update: {},
        create: {
            userId: supportUser.id,
            name: 'Alex Support',
            languages: ['English', 'Spanish'],
            isAvailable: true,
        },
    });
    const lawyerUser = await prisma.user.upsert({
        where: { email: 'lawyer@immiassist.com' },
        update: {},
        create: {
            name: 'Sarah Lawyer',
            email: 'lawyer@immiassist.com',
            passwordHash: hashPassword('password123'),
            role: 'LAWYER',
        },
    });
    await prisma.lawyer.upsert({
        where: { userId: lawyerUser.id },
        update: {},
        create: {
            userId: lawyerUser.id,
            name: 'Sarah Lawyer',
            specialization: ['Immigration', 'Visa Denials'],
            languages: ['English'],
            barNumber: 'BAR123456',
            rating: 4.9,
        },
    });
    await prisma.user.upsert({
        where: { email: 'admin@immiassist.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@immiassist.com',
            passwordHash: hashPassword('admin123'),
            role: 'ADMIN',
        },
    });
    console.log('✅ Seed completed successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map