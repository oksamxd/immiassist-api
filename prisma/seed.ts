import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding ImmiAssist database...');

  // ── Create Users ──────────────────────────────────────────────────────────

  const memberUser = await prisma.user.upsert({
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

  const lawyer2User = await prisma.user.upsert({
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
  });

  // ── Create a demo case ───────────────────────────────────────────────────

  const lawyerRecord = await prisma.lawyer.findUnique({ where: { userId: lawyerUser.id } });
  const associateRecord = await prisma.legalAssociate.findUnique({ where: { userId: associateUser.id } });

  const demoCase = await prisma.case.upsert({
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
  });

  // ── Create demo events ───────────────────────────────────────────────────

  const events = [
    { eventType: 'CASE_CREATED' as const, title: 'Case Opened', description: 'Immigration case created by Arjun Sharma.', actorType: 'USER', actorId: memberUser.id },
    { eventType: 'LEGAL_ASSOCIATE_ASSIGNED' as const, title: 'Legal Associate Assigned', description: 'Marcus Rivera assigned to manage intake.', actorType: 'SYSTEM', actorId: null },
    { eventType: 'DOCUMENT_UPLOADED' as const, title: 'Documents Uploaded', description: 'Passport and I-20 uploaded for review.', actorType: 'USER', actorId: memberUser.id },
    { eventType: 'LAWYER_ASSIGNED' as const, title: 'Lawyer Assigned', description: 'Sarah Chen assigned as lead counsel.', actorType: 'SYSTEM', actorId: null },
    { eventType: 'APPOINTMENT_SCHEDULED' as const, title: 'Consultation Scheduled', description: 'Initial consultation with Sarah Chen on June 10, 2026.', actorType: 'LAWYER', actorId: lawyerUser.id },
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

  // ── Create demo appointment ──────────────────────────────────────────────

  if (lawyerRecord) {
    await prisma.appointment.upsert({
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
    });
  }

  // ── Create sample notification ───────────────────────────────────────────

  await prisma.notification.create({
    data: {
      userId: memberUser.id,
      caseId: demoCase.id,
      type: 'APPOINTMENT_REMINDER',
      title: 'Consultation Tomorrow',
      message: 'Your consultation with Sarah Chen is scheduled for tomorrow at 2:00 PM.',
      status: 'PENDING',
    },
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('  Member:         member@immiassist.io   / member123');
  console.log('  Lawyer:         lawyer@immiassist.io   / lawyer123');
  console.log('  Legal Associate: associate@immiassist.io / associate123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
