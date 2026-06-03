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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var crypto = __importStar(require("crypto"));
var prisma = new client_1.PrismaClient();
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var memberUser, lawyerUser, associateUser, lawyer2User, lawyerRecord, associateRecord, demoCase, events, _i, events_1, event_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🌱 Seeding ImmiAssist database...');
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'member@immiassist.io' },
                            update: {},
                            create: {
                                name: 'Arjun Sharma',
                                email: 'member@immiassist.io',
                                phone: '+1-555-0101',
                                passwordHash: hashPassword('member123'),
                                role: 'MEMBER',
                                language: 'en',
                                profile: {
                                    create: {
                                        nationality: 'Indian',
                                        passportNumber: 'P1234567',
                                        visaType: 'F-1',
                                        employerOrUniversity: 'MIT',
                                        preferredLanguage: 'en',
                                        currentLocation: 'Cambridge, MA',
                                    },
                                },
                            },
                        })];
                case 1:
                    memberUser = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'lawyer@immiassist.io' },
                            update: {},
                            create: {
                                name: 'Sarah Chen',
                                email: 'lawyer@immiassist.io',
                                phone: '+1-555-0202',
                                passwordHash: hashPassword('lawyer123'),
                                role: 'LAWYER',
                                language: 'en',
                                lawyer: {
                                    create: {
                                        specialization: ['Visa Processing', 'Work Permits', 'Deportation Defense'],
                                        location: 'New York, NY',
                                        languages: ['English', 'Mandarin', 'Spanish'],
                                        barNumber: 'NY-2021-4892',
                                        availabilityStatus: true,
                                        rating: 4.9,
                                        casesHandled: 128,
                                    },
                                },
                            },
                        })];
                case 2:
                    lawyerUser = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'associate@immiassist.io' },
                            update: {},
                            create: {
                                name: 'Marcus Rivera',
                                email: 'associate@immiassist.io',
                                phone: '+1-555-0303',
                                passwordHash: hashPassword('associate123'),
                                role: 'LEGAL_ASSOCIATE',
                                language: 'en',
                                legalAssociate: {
                                    create: {
                                        availabilityStatus: true,
                                        languages: ['English', 'Spanish'],
                                        activeCaseCount: 3,
                                    },
                                },
                            },
                        })];
                case 3:
                    associateUser = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'lawyer2@immiassist.io' },
                            update: {},
                            create: {
                                name: 'Priya Patel',
                                email: 'lawyer2@immiassist.io',
                                phone: '+1-555-0404',
                                passwordHash: hashPassword('lawyer123'),
                                role: 'LAWYER',
                                language: 'en',
                                lawyer: {
                                    create: {
                                        specialization: ['Family Sponsorship', 'Citizenship', 'Refugee Claims'],
                                        location: 'Chicago, IL',
                                        languages: ['English', 'Hindi', 'Gujarati'],
                                        barNumber: 'IL-2019-7231',
                                        availabilityStatus: true,
                                        rating: 4.7,
                                        casesHandled: 89,
                                    },
                                },
                            },
                        })];
                case 4:
                    lawyer2User = _b.sent();
                    return [4 /*yield*/, prisma.lawyer.findUnique({ where: { userId: lawyerUser.id } })];
                case 5:
                    lawyerRecord = _b.sent();
                    return [4 /*yield*/, prisma.legalAssociate.findUnique({ where: { userId: associateUser.id } })];
                case 6:
                    associateRecord = _b.sent();
                    return [4 /*yield*/, prisma.case.upsert({
                            where: { caseNumber: 'IMM-DEMO-001' },
                            update: {},
                            create: {
                                caseNumber: 'IMM-DEMO-001',
                                userId: memberUser.id,
                                caseType: 'VISA_PROCESSING',
                                status: 'LAWYER_ASSIGNED',
                                priority: 'HIGH',
                                riskLevel: 'MEDIUM',
                                assignedLawyerId: lawyerUser.id,
                                assignedLegalAssociateId: associateUser.id,
                                summary: 'F-1 to H-1B visa status change for software engineer position at a US tech company.',
                                aiContext: {
                                    intakeComplete: true,
                                    visaType: 'H-1B',
                                    urgency: 'high',
                                    notes: 'Cap-exempt employer, priority date current',
                                },
                                detail: {
                                    create: {
                                        issueType: 'Visa Status Change',
                                        visaCategory: 'H-1B',
                                        destinationCountry: 'United States',
                                        notes: 'Transitioning from F-1 OPT to H-1B. I-797 approval pending.',
                                        metadata: { currentStatus: 'F-1 OPT', targetStatus: 'H-1B', employer: 'TechCorp Inc.' },
                                    },
                                },
                            },
                        })];
                case 7:
                    demoCase = _b.sent();
                    events = [
                        { eventType: 'CASE_CREATED', title: 'Case Opened', description: 'Immigration case created by Arjun Sharma.', actorType: 'USER', actorId: memberUser.id },
                        { eventType: 'LEGAL_ASSOCIATE_ASSIGNED', title: 'Legal Associate Assigned', description: 'Marcus Rivera assigned to manage intake.', actorType: 'SYSTEM', actorId: null },
                        { eventType: 'DOCUMENT_UPLOADED', title: 'Documents Uploaded', description: 'Passport and I-20 uploaded for review.', actorType: 'USER', actorId: memberUser.id },
                        { eventType: 'LAWYER_ASSIGNED', title: 'Lawyer Assigned', description: 'Sarah Chen assigned as lead counsel.', actorType: 'SYSTEM', actorId: null },
                        { eventType: 'APPOINTMENT_SCHEDULED', title: 'Consultation Scheduled', description: 'Initial consultation with Sarah Chen on June 10, 2026.', actorType: 'LAWYER', actorId: lawyerUser.id },
                    ];
                    _i = 0, events_1 = events;
                    _b.label = 8;
                case 8:
                    if (!(_i < events_1.length)) return [3 /*break*/, 11];
                    event_1 = events_1[_i];
                    return [4 /*yield*/, prisma.caseEvent.create({
                            data: {
                                caseId: demoCase.id,
                                eventType: event_1.eventType,
                                title: event_1.title,
                                description: event_1.description,
                                actorType: event_1.actorType,
                                actorId: (_a = event_1.actorId) !== null && _a !== void 0 ? _a : undefined,
                                metadata: {},
                            },
                        })];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 8];
                case 11:
                    if (!lawyerRecord) return [3 /*break*/, 13];
                    return [4 /*yield*/, prisma.appointment.upsert({
                            where: { id: 'demo-appt-001' },
                            update: {},
                            create: {
                                id: 'demo-appt-001',
                                caseId: demoCase.id,
                                lawyerId: lawyerRecord.id,
                                appointmentType: 'CONSULTATION',
                                scheduledAt: new Date('2026-06-10T14:00:00Z'),
                                meetingLink: 'https://meet.google.com/demo-immi',
                                status: 'CONFIRMED',
                                notes: 'Discuss H-1B cap-exempt filing strategy.',
                            },
                        })];
                case 12:
                    _b.sent();
                    _b.label = 13;
                case 13: 
                // ── Create sample notification ───────────────────────────────────────────
                return [4 /*yield*/, prisma.notification.create({
                        data: {
                            userId: memberUser.id,
                            caseId: demoCase.id,
                            type: 'APPOINTMENT_REMINDER',
                            title: 'Consultation Tomorrow',
                            message: 'Your consultation with Sarah Chen is scheduled for tomorrow at 2:00 PM.',
                            status: 'PENDING',
                        },
                    })];
                case 14:
                    // ── Create sample notification ───────────────────────────────────────────
                    _b.sent();
                    console.log('✅ Seed complete!');
                    console.log('');
                    console.log('📋 Demo Credentials:');
                    console.log('  Member:         member@immiassist.io   / member123');
                    console.log('  Lawyer:         lawyer@immiassist.io   / lawyer123');
                    console.log('  Legal Associate: associate@immiassist.io / associate123');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(console.error)
    .finally(function () { return prisma.$disconnect(); });
