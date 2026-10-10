const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('2026konekta', 10);

  const users = [
    {
      name: 'Juan Dela Cruz (Farmer)',
      registryId: 'farmer-01',
      passwordHash: passwordHash,
      role: 'farmer',
      baranggay: 'San Manuel'
    },
    {
      name: 'TARBCO Depot (Provider)',
      registryId: 'provider-01',
      passwordHash: passwordHash,
      role: 'provider',
      baranggay: 'San Manuel'
    },
    {
      name: 'Baranggay San Manuel Admin',
      registryId: 'admin-01',
      passwordHash: passwordHash,
      role: 'admin',
      baranggay: 'San Manuel'
    },
    {
      name: 'TESDA Field Mechanic #889',
      registryId: 'mechanic-01',
      passwordHash: passwordHash,
      role: 'mechanic',
      baranggay: 'San Manuel'
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { registryId: user.registryId },
      update: {},
      create: user
    });
    console.log(`Created/Verified user: ${user.registryId}`);
  }

  // Create some initial assets for the provider
  const provider = await prisma.user.findUnique({ where: { registryId: 'provider-01' } });
  
  const existingAssets = await prisma.asset.count({ where: { providerId: provider.id } });
  
  if (existingAssets === 0) {
    await prisma.asset.createMany({
      data: [
        {
          providerId: provider.id,
          name: 'Kubota DC-70 Plus Combine Harvester',
          type: 'harvester',
          description: '70 HP Turbo Tracked',
          rate: 2800,
          unit: 'per_ha',
          status: 'available',
          location: 'San Manuel, Tagum City'
        },
        {
          providerId: provider.id,
          name: 'Yanmar EF494T Heavy Duty Tractor',
          type: 'tractor',
          description: '49 HP 4WD',
          rate: 2400,
          unit: 'per_ha',
          status: 'available',
          location: 'San Manuel, Tagum City'
        }
      ]
    });
    console.log('Created initial assets for provider');
  } else {
    console.log('Assets already exist');
  }

  // Create an initial announcement
  const admin = await prisma.user.findUnique({ where: { registryId: 'admin-01' } });
  
  const existingAnnouncements = await prisma.announcement.count({ where: { baranggay: 'San Manuel' } });
  if (existingAnnouncements === 0) {
    await prisma.announcement.create({
      data: {
        title: 'Welcome to UmaKonekta',
        content: 'Ito ay test announcement para sa San Manuel.',
        authorId: admin.id,
        baranggay: 'San Manuel'
      }
    });
    console.log('Created initial announcement');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
