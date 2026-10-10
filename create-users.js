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
      baranggay: 'San Manuel',
    },
    {
      name: 'Test Provider',
      registryId: 'provider-01',
      role: 'provider',
      passwordHash: passwordHash,
      baranggay: 'San Manuel',
    },
    {
      name: 'Test Admin (San Manuel)',
      registryId: 'admin-01',
      role: 'admin',
      passwordHash: passwordHash,
      baranggay: 'San Manuel',
    },
    {
      name: 'Test Mechanic',
      registryId: 'mechanic-01',
      role: 'mechanic',
      passwordHash: passwordHash,
      baranggay: 'San Manuel',
    }
  ];

  // Clear existing data for fresh seed
  await prisma.announcement.deleteMany();
  await prisma.dispatchRequest.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany({
    where: { registryId: { in: ['farmer-01', 'provider-01', 'admin-01', 'mechanic-01'] } }
  });

  for (const user of usersToCreate) {
    const createdUser = await prisma.user.create({ data: user });
    console.log(`Successfully created ${user.role} account: ${createdUser.registryId} in ${createdUser.baranggay}`);

    if (user.role === 'admin') {
      await prisma.announcement.create({
        data: {
          title: 'Welcome to UmaKonekta!',
          content: 'Baranggay San Manuel is now live on UmaKonekta. Farmers and Providers can now connect directly for machinery services.',
          baranggay: user.baranggay,
          authorId: createdUser.id
        }
      });
      console.log(`Created announcement for Baranggay ${user.baranggay}`);
    }
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
