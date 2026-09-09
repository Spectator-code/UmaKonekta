const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const users = [
    {
      role: 'farmer',
      registryId: '03-49-12-00841',
      password: '4092',
<<<<<<< HEAD
      name: 'J. Madronero'
=======
      name: 'Juan Dela Cruz'
>>>>>>> 3f298d9d3bf6ac4e2afcae546047cdcbfe778364
    },
    {
      role: 'provider',
      registryId: 'CDA-FCA-2024-9140',
      password: 'TagumAdmin2024!',
      name: 'Tagum FCA Depot'
    },
    {
      role: 'mechanic',
      registryId: 'MECH-TESDA-889',
      password: '8890',
      name: 'Mario Santos'
    },
    {
      role: 'admin',
      registryId: 'GOV-MAO-R11-0042',
      password: 'MAO-Command-9912',
      name: 'LGU Admin Officer'
    }
  ]

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({
      where: { registryId: u.registryId },
      update: {},
      create: {
        role: u.role,
        registryId: u.registryId,
        passwordHash,
        name: u.name
      }
    })
  }

  // Add some demo assets
  const provider = await prisma.user.findUnique({ where: { registryId: 'CDA-FCA-2024-9140' } })
  if (provider) {
    await prisma.asset.create({
      data: {
        providerId: provider.id,
        type: 'tractor',
        name: 'Kubota 4WD Tractor',
        description: 'Heavy duty tractor suitable for muddy fields.',
        rate: 1500,
        unit: 'per_ha',
        location: 'Tagum City, Davao del Norte'
      }
    })
  }

  console.log("Database seeded!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
