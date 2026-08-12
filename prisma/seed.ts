import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@lysi.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@lysi.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const subjects = [
    'Segurança do ambiente operacional',
    'Instalação, Configuração e Suporte de equipamentos',
    'Atividades em Sistemas (Softwares)',
    'Atividades em e-mail',
    'Dúvidas gerais em relação a softwares e hardwares',
    'Contagem de impressão',
    'Suporte a usuário',
    'Atividade externa',
    'Suporte remoto ao usuário',
    'Outras Atividades (apresentações, edição de formulários, etc..)',
  ]

  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('✅ Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
