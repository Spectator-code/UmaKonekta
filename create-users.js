const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const usersToCreate = [
    {
      name: 'Test Farmer',
      registryId: 'farmer-01',
      role: 'farmer',
      passwordHash: passwordHash,
    },
    {
      name: 'Test Provider',
      registryId: 'provider-01',
      role: 'provider',
      passwordHash: passwordHash,
    },
    {
      name: 'Test Admin',
      registryId: 'admin-01',
      role: 'admin',
      passwordHash: passwordHash,
    },
    {
      name: 'Test Mechanic',
      registryId: 'mechanic-01',
      role: 'mechanic',
      passwordHash: passwordHash,
    }
  ];

  for (const user of usersToCreate) {
    const existingUser = await prisma.user.findUnique({
      where: { registryId: user.registryId }
    });

    if (existingUser) {
      console.log(`Account ${user.registryId} already exists.`);
      continue;
    }

    await prisma.user.create({
      data: user
    });

    console.log(`Successfully created ${user.role} account: ${user.registryId}`);
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
