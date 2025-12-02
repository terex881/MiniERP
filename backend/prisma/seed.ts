import { PrismaClient, Role, LeadStatus, ClaimStatus, ClaimPriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.activity.deleteMany();
  await prisma.claimAttachment.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.clientProduct.deleteMany();
  await prisma.client.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👤 Creating users...');
  
  const adminPassword = await hashPassword('Admin@123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@minicrm.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      phone: '+1234567890',
      role: Role.ADMIN,
    },
  });

  const supervisorPassword = await hashPassword('Super@123');
  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@minicrm.com',
      password: supervisorPassword,
      firstName: 'Jane',
      lastName: 'Supervisor',
      phone: '+1234567891',
      role: Role.SUPERVISOR,
    },
  });

  const operatorPassword = await hashPassword('Oper@123');
  const operator = await prisma.user.create({
    data: {
      email: 'operator@minicrm.com',
      password: operatorPassword,
      firstName: 'John',
      lastName: 'Operator',
      phone: '+1234567892',
      role: Role.OPERATOR,
    },
  });

  const operator2 = await prisma.user.create({
    data: {
      email: 'operator2@minicrm.com',
      password: operatorPassword,
      firstName: 'Sarah',
      lastName: 'Smith',
      phone: '+1234567893',
      role: Role.OPERATOR,
    },
  });

  console.log('✅ Users created');

  // Create products
  console.log('📦 Creating products...');
  
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Basic Plan',
        description: 'Essential features for small businesses',
        price: 29.99,
        billingCycle: 'monthly',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Professional Plan',
        description: 'Advanced features for growing businesses',
        price: 79.99,
        billingCycle: 'monthly',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Enterprise Plan',
        description: 'Full-featured solution for large organizations',
        price: 199.99,
        billingCycle: 'monthly',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Annual Premium',
        description: 'Best value - all features, billed yearly',
        price: 899.99,
        billingCycle: 'yearly',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Setup & Training',
        description: 'One-time setup and training package',
        price: 499.99,
        billingCycle: 'one-time',
      },
    }),
  ]);

  console.log('✅ Products created');

  // Create leads
  console.log('🎯 Creating leads...');
  
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@techcorp.com',
        phone: '+1555123001',
        company: 'TechCorp Inc',
        source: 'Website',
        status: LeadStatus.NEW,
        notes: 'Interested in enterprise solutions',
        estimatedValue: 5000,
        createdById: operator.id,
        assignedToId: operator.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Emily',
        lastName: 'Williams',
        email: 'emily.w@startupxyz.io',
        phone: '+1555123002',
        company: 'StartupXYZ',
        source: 'Referral',
        status: LeadStatus.CONTACTED,
        notes: 'Referral from existing client',
        estimatedValue: 2500,
        createdById: operator.id,
        assignedToId: operator2.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'David',
        lastName: 'Brown',
        email: 'dbrown@globalsolutions.net',
        phone: '+1555123003',
        company: 'Global Solutions',
        source: 'Trade Show',
        status: LeadStatus.QUALIFIED,
        notes: 'Met at industry conference',
        estimatedValue: 15000,
        createdById: supervisor.id,
        assignedToId: operator.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Lisa',
        lastName: 'Taylor',
        email: 'ltaylor@innovate.co',
        company: 'Innovate Co',
        source: 'Cold Call',
        status: LeadStatus.NEW,
        estimatedValue: 1500,
        createdById: operator2.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'James',
        lastName: 'Anderson',
        email: 'janderson@bigdata.io',
        phone: '+1555123005',
        company: 'BigData.io',
        source: 'Website',
        status: LeadStatus.LOST,
        notes: 'Chose competitor',
        estimatedValue: 8000,
        createdById: operator.id,
        assignedToId: operator.id,
      },
    }),
  ]);

  console.log('✅ Leads created');

  // Create clients
  console.log('🏢 Creating clients...');
  
  // Client with portal access
  const clientPassword = await hashPassword('Client@123');
  const clientUser = await prisma.user.create({
    data: {
      email: 'client@acmecorp.com',
      password: clientPassword,
      firstName: 'Robert',
      lastName: 'Miller',
      phone: '+1555200001',
      role: Role.CLIENT,
    },
  });

  const client1 = await prisma.client.create({
    data: {
      firstName: 'Robert',
      lastName: 'Miller',
      email: 'client@acmecorp.com',
      phone: '+1555200001',
      company: 'Acme Corp',
      address: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      taxId: 'XX-1234567',
      userId: clientUser.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      firstName: 'Jennifer',
      lastName: 'Davis',
      email: 'jennifer@digitalfirst.com',
      phone: '+1555200002',
      company: 'Digital First LLC',
      address: '456 Tech Blvd',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      taxId: 'YY-7654321',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      firstName: 'Christopher',
      lastName: 'Wilson',
      email: 'cwilson@alphasystems.io',
      phone: '+1555200003',
      company: 'Alpha Systems',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
    },
  });

  console.log('✅ Clients created');

  // Create client products (subscriptions)
  console.log('📋 Creating subscriptions...');
  
  await Promise.all([
    prisma.clientProduct.create({
      data: {
        clientId: client1.id,
        productId: products[2].id, // Enterprise Plan
        quantity: 1,
      },
    }),
    prisma.clientProduct.create({
      data: {
        clientId: client1.id,
        productId: products[4].id, // Setup & Training
        quantity: 1,
      },
    }),
    prisma.clientProduct.create({
      data: {
        clientId: client2.id,
        productId: products[1].id, // Professional Plan
        quantity: 2,
        customPrice: 69.99, // Discount
      },
    }),
    prisma.clientProduct.create({
      data: {
        clientId: client3.id,
        productId: products[0].id, // Basic Plan
        quantity: 1,
      },
    }),
  ]);

  console.log('✅ Subscriptions created');

  // Create claims
  console.log('📝 Creating claims...');
  
  await Promise.all([
    prisma.claim.create({
      data: {
        title: 'Cannot access dashboard',
        description: 'Getting 403 error when trying to access the main dashboard after login.',
        status: ClaimStatus.OPEN,
        priority: ClaimPriority.HIGH,
        clientId: client1.id,
        createdById: clientUser.id,
      },
    }),
    prisma.claim.create({
      data: {
        title: 'Report generation slow',
        description: 'Monthly reports are taking over 5 minutes to generate.',
        status: ClaimStatus.IN_PROGRESS,
        priority: ClaimPriority.MEDIUM,
        clientId: client1.id,
        createdById: clientUser.id,
        assignedToId: operator.id,
      },
    }),
    prisma.claim.create({
      data: {
        title: 'Request for new feature',
        description: 'Would like to have bulk import functionality for contacts.',
        status: ClaimStatus.OPEN,
        priority: ClaimPriority.LOW,
        clientId: client2.id,
        createdById: admin.id,
      },
    }),
    prisma.claim.create({
      data: {
        title: 'Billing inquiry',
        description: 'Question about the invoice from last month.',
        status: ClaimStatus.RESOLVED,
        priority: ClaimPriority.MEDIUM,
        resolution: 'Clarified billing cycle and sent updated invoice.',
        clientId: client3.id,
        createdById: admin.id,
        assignedToId: supervisor.id,
        resolvedAt: new Date(),
      },
    }),
    prisma.claim.create({
      data: {
        title: 'API integration issue',
        description: 'Webhook notifications are not being received consistently.',
        status: ClaimStatus.IN_PROGRESS,
        priority: ClaimPriority.URGENT,
        clientId: client2.id,
        createdById: admin.id,
        assignedToId: operator2.id,
      },
    }),
  ]);

  console.log('✅ Claims created');

  // Create some activity logs
  console.log('📊 Creating activity logs...');
  
  await Promise.all([
    prisma.activity.create({
      data: {
        action: 'CREATED',
        description: 'Lead "Michael Johnson" created',
        userId: operator.id,
        leadId: leads[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        action: 'CREATED',
        description: 'Client "Acme Corp" created',
        userId: admin.id,
        clientId: client1.id,
      },
    }),
    prisma.activity.create({
      data: {
        action: 'STATUS_CHANGED',
        description: 'Lead status changed from NEW to CONTACTED',
        metadata: { oldStatus: 'NEW', newStatus: 'CONTACTED' },
        userId: operator.id,
        leadId: leads[1].id,
      },
    }),
  ]);

  console.log('✅ Activity logs created');

  // Summary
  console.log('\n========================================');
  console.log('🎉 Database seeding completed!');
  console.log('========================================\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 5 (1 admin, 1 supervisor, 2 operators, 1 client)`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Leads: ${leads.length}`);
  console.log(`   - Clients: 3`);
  console.log(`   - Claims: 5`);
  console.log('\n🔑 Login Credentials:');
  console.log('   Admin:      admin@minicrm.com / Admin@123');
  console.log('   Supervisor: supervisor@minicrm.com / Super@123');
  console.log('   Operator:   operator@minicrm.com / Oper@123');
  console.log('   Client:     client@acmecorp.com / Client@123');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

