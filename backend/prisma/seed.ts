import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const motDePasse = process.env.ADMIN_PASSWORD;

  if (!email || !motDePasse) {
    throw new Error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans le fichier .env');
  }

  const motDePasseHashe = await argon2.hash(motDePasse);

  const admin = await prisma.administrateur.upsert({
    where: { email },
    update: {},
    create: { email, motDePasseHashe },
  });

  console.log(`Compte administrateur prêt : ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());