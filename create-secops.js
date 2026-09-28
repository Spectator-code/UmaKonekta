const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const registryIds = ['secops-1-23-A001', 'SECOPS-ALPHA-01'];
  const password = 'classified';
  const passwordHash = await bcrypt.hash(password, 10);

  for (const registryId of registryIds) {
    const existingSecops = await prisma.user.findUnique({
      where: { registryId }
    });

    if (existingSecops) {
      console.log(`SecOps account ${registryId} already exists.`);
      continue;
    }

    await prisma.user.create({
      data: {
        name: 'Alpha Security Operator',
        registryId: registryId,
        passwordHash: passwordHash,
        role: 'secops'
      }
    });

    console.log(`Successfully created SecOps account: ${registryId}`);
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
