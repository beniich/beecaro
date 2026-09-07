const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DB Seeding...');

  // Reset data (optional - uncomment for hard reset)
  // await prisma.maintenanceLog.deleteMany();
  // await prisma.workOrder.deleteMany();
  // await prisma.asset.deleteMany();
  // await prisma.user.deleteMany();

  // Create default admin
  const adminEmail = 'admin@BeeCarbonat.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123!', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN',
      }
    });
    console.log(`✅ Default admin created: ${adminEmail}`);
  } else {
    console.log('⏩ Admin already exists, skipping.');
  }

  // Create demo data
  if (process.env.ENABLE_DEMO_MODE === 'true') {
    console.log('🏗️ Creating demo assets...');
    await prisma.asset.create({
      data: {
        name: 'HVAC Unit Alpha',
        type: 'HVAC',
        status: 'OPERATIONAL',
        healthScore: 92.5
      }
    });
    console.log('✅ Demo assets created.');
  }

  console.log('🏁 Seeding completed.');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
