import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding ImmiAssist database...');

  // ── Create Users ──────────────────────────────────────────────────────────

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

  // ── Create a demo case ───────────────────────────────────────────────────

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

  // ── Create demo events ───────────────────────────────────────────────────

  const events = [
    { eventType: 'CASE_CREATED' as const, title: 'Case Opened', description: 'Immigration case created by Arjun Sharma.', actorType: 'USER', actorId: memberUser.id },
    { eventType: 'LEGAL_ASSOCIATE_ASSIGNED' as const, title: 'Legal Associate Assigned', description: 'Marcus Rivera assigned to manage intake.', actorType: 'SYSTEM', actorId: null },
    { eventType: 'DOCUMENT_UPLOADED' as const, title: 'Documents Uploaded', description: 'Passport and I-20 uploaded for review.', actorType: 'USER', actorId: memberUser.id },
    { eventType: 'LAWYER_ASSIGNED' as const, title: 'Lawyer Assigned', description: 'Sarah Chen assigned as lead counsel.', actorType: 'SYSTEM', actorId: null },
    { eventType: 'APPOINTMENT_SCHEDULED' as const, title: 'Consultation Scheduled', description: 'Initial consultation scheduled.', actorType: 'LAWYER', actorId: lawyerUser.id },
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

  // ── Create demo appointment (20h from now) ───────────────────────────────

  const appointmentTime = new Date(Date.now() + 20 * 60 * 60 * 1000); // 20 hours from now
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

  // ── Create demo court date (5 days from now) ─────────────────────────────

  const courtDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
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

    // ── Generate 5 additional random cases ─────────────────────────────
    const caseTypes = ['WORK_PERMIT', 'FAMILY_SPONSORSHIP', 'DEPORTATION', 'CITIZENSHIP', 'STUDY_PERMIT'];
    const summaries = [
      'Applying for an employment authorization document (EAD) based on pending asylum.',
      'Spousal sponsorship for permanent residency (green card).',
      'Defending against deportation proceedings due to visa overstay.',
      'Naturalization application after 5 years of permanent residency.',
      'F-1 student visa application for university enrollment in Fall 2026.'
    ];

    for (let i = 0; i < 5; i++) {
      const c = await prisma.case.upsert({
        where: { caseNumber: `IMM-DEMO-00${i+2}` },
        update: {},
        create: {
          caseNumber: `IMM-DEMO-00${i+2}`,
          userId: member2User.id,
          caseType: caseTypes[i],
          status: 'ACTIVE',
          priority: i % 2 === 0 ? 'HIGH' : 'NORMAL',
          riskLevel: i % 3 === 0 ? 'HIGH' : 'LOW',
          assignedLawyerId: lawyerUser.id,
          assignedLegalAssociateId: associateUser.id,
          summary: summaries[i],
        },
      });

      // Appt
      const tAppt = new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000); // i+2 days from now
      await prisma.appointment.upsert({
        where: { id: `demo-appt-00${i+2}` },
        update: { scheduledAt: tAppt },
        create: {
          id: `demo-appt-00${i+2}`,
          caseId: c.id,
          lawyerId: lawyerRecord.id,
          appointmentType: i % 2 === 0 ? 'CONSULTATION' : 'FOLLOW_UP',
          scheduledAt: tAppt,
          status: 'SCHEDULED',
          notes: `Discussion for ${caseTypes[i]}`,
        },
      });

      // Court Date
      if (i % 2 === 0) {
        const tCourt = new Date(Date.now() + (i + 15) * 24 * 60 * 60 * 1000); 
        await prisma.courtDate.upsert({
          where: { id: `demo-court-00${i+2}` },
          update: { date: tCourt },
          create: {
            id: `demo-court-00${i+2}`,
            caseId: c.id,
            lawyerId: lawyerRecord.id,
            date: tCourt,
            location: `Court Room ${100 + i}`,
            status: 'SCHEDULED',
            notes: `Hearing for ${caseTypes[i]}`,
          },
        });
      }
    }
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
