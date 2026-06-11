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
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@immiassist.io' },
        update: {},
        create: {
            name: 'System Admin',
            email: 'admin@immiassist.io',
            phone: '+1-555-0000',
            passwordHash: hashPassword('admin123'),
            role: 'ADMIN',
            language: 'en',
        },
    });
    const memberUser = await prisma.user.upsert({
        where: { email: 'member@immiassist.io' },
        update: {
            profile: {
                upsert: {
                    create: { preferredLanguage: 'en', passportNumber: null, nationality: null, countryOfResidence: null, visaType: null },
                    update: {
                        nationality: null,
                        passportNumber: null,
                        countryOfResidence: null,
                        visaType: null,
                    }
                }
            },
            legalProfile: {
                upsert: {
                    create: { currentVisaStatus: null, currentEmployer: null, visaExpiry: null },
                    update: {
                        currentVisaStatus: null,
                        currentEmployer: null,
                        visaExpiry: null,
                    }
                }
            }
        },
        create: {
            name: 'Arjun Sharma',
            email: 'member@immiassist.io',
            phone: '+1-555-0101',
            passwordHash: hashPassword('member123'),
            role: 'MEMBER',
            language: 'en',
            profile: {
                create: {
                    preferredLanguage: 'en',
                },
            },
            legalProfile: {
                create: {},
            },
        },
    });
    const member2User = await prisma.user.upsert({
        where: { email: 'newmember@immiassist.io' },
        update: {},
        create: {
            name: 'Carlos Mendoza',
            email: 'newmember@immiassist.io',
            phone: '+1-555-0102',
            passwordHash: hashPassword('member123'),
            role: 'MEMBER',
            language: 'es',
            profile: {
                create: {
                    preferredLanguage: 'es',
                },
            },
            legalProfile: {
                create: {},
            },
        },
    });
    const lawyerUser = await prisma.user.upsert({
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
    });
    const associateUser = await prisma.user.upsert({
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
    });
    const lawyerRecord = await prisma.lawyer.findUnique({ where: { userId: lawyerUser.id } });
    const associateRecord = await prisma.legalAssociate.findUnique({ where: { userId: associateUser.id } });
    const demoCase = await prisma.case.upsert({
        where: { caseNumber: 'IMM-DEMO-001' },
        update: { status: 'COURT_DATE_ASSIGNED' },
        create: {
            caseNumber: 'IMM-DEMO-001',
            userId: memberUser.id,
            caseType: 'VISA_PROCESSING',
            status: 'COURT_DATE_ASSIGNED',
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
    });
    const events = [
        { eventType: 'CASE_CREATED', title: 'Case Opened', description: 'Immigration case created by Arjun Sharma.', actorType: 'USER', actorId: memberUser.id },
        { eventType: 'LEGAL_ASSOCIATE_ASSIGNED', title: 'Legal Associate Assigned', description: 'Marcus Rivera assigned to manage intake.', actorType: 'SYSTEM', actorId: null },
        { eventType: 'DOCUMENT_UPLOADED', title: 'Documents Uploaded', description: 'Passport and I-20 uploaded for review.', actorType: 'USER', actorId: memberUser.id },
        { eventType: 'LAWYER_ASSIGNED', title: 'Lawyer Assigned', description: 'Sarah Chen assigned as lead counsel.', actorType: 'SYSTEM', actorId: null },
        { eventType: 'APPOINTMENT_SCHEDULED', title: 'Consultation Scheduled', description: 'Initial consultation scheduled.', actorType: 'LAWYER', actorId: lawyerUser.id },
    ];
    for (const event of events) {
        await prisma.caseEvent.create({
            data: {
                caseId: demoCase.id,
                eventType: event.eventType,
                title: event.title,
                description: event.description,
                actorType: event.actorType,
                actorId: event.actorId ?? undefined,
                metadata: {},
            },
        });
    }
    const appointmentTime = new Date(Date.now() + 20 * 60 * 60 * 1000);
    if (lawyerRecord) {
        await prisma.appointment.upsert({
            where: { id: 'demo-appt-001' },
            update: { scheduledAt: appointmentTime },
            create: {
                id: 'demo-appt-001',
                caseId: demoCase.id,
                lawyerId: lawyerRecord.id,
                appointmentType: 'CONSULTATION',
                scheduledAt: appointmentTime,
                meetingLink: 'https://meet.google.com/demo-immi',
                status: 'CONFIRMED',
                notes: 'Discuss H-1B cap-exempt filing strategy.',
            },
        });
    }
    const courtDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    if (lawyerRecord) {
        await prisma.courtDate.upsert({
            where: { id: 'demo-court-001' },
            update: { date: courtDate },
            create: {
                id: 'demo-court-001',
                caseId: demoCase.id,
                lawyerId: lawyerRecord.id,
                date: courtDate,
                location: 'New York Immigration Court, Room 402',
                status: 'SCHEDULED',
                notes: 'Master Calendar Hearing for H-1B transition review.',
            },
        });
    }
    console.log('✅ Seed complete!');
    console.log('');
    console.log('📋 Demo Credentials:');
    console.log('  Admin:          admin@immiassist.io    / admin123');
    console.log('  Member 1:       member@immiassist.io   / member123');
    console.log('  Member 2 (New): newmember@immiassist.io/ member123');
    console.log('  Lawyer:         lawyer@immiassist.io   / lawyer123');
    console.log('  Associate:      associate@immiassist.io / associate123');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map