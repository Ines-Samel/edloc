import { prisma } from '../lib/prisma';
import { Prisma } from '../../generated/prisma';
import { BienInput, ListeBiensQuery } from '../schemas/biens.schema';

export async function listerBiens(idBailleur: string, query: ListeBiensQuery) {
  const { recherche, commune, page, limite } = query;

  const where: Prisma.BienWhereInput = { idBailleur };

  if (recherche) {
    where.OR = [
      { adresse: { contains: recherche, mode: 'insensitive' } },
      { ville: { contains: recherche, mode: 'insensitive' } },
    ];
  }

  if (commune) {
    where.ville = { equals: commune, mode: 'insensitive' };
  }

  const skip = (page - 1) * limite;

  const [donnees, total] = await Promise.all([
    prisma.bien.findMany({
      where,
      orderBy: [{ ville: 'asc' }, { adresse: 'asc' }],
      skip,
      take: limite,
    }),
    prisma.bien.count({ where }),
  ]);

  return {
    donnees,
    pagination: {
      page,
      limite,
      total,
      totalPages: Math.ceil(total / limite),
    },
  };
}

export async function creerBien(idBailleur: string, donnees: BienInput) {
  return prisma.bien.create({
    data: { ...donnees, idBailleur },
  });
}

export async function obtenirBien(idBailleur: string, idBien: string) {
  return prisma.bien.findFirst({ where: { idBien, idBailleur } });
}

export async function modifierBien(
  idBailleur: string,
  idBien: string,
  donnees: BienInput,
) {
  const bien = await prisma.bien.findFirst({ where: { idBien, idBailleur } });
  if (!bien) return null;
  return prisma.bien.update({ where: { idBien }, data: donnees });
}

export async function supprimerBien(idBailleur: string, idBien: string) {
  const bien = await prisma.bien.findFirst({ where: { idBien, idBailleur } });
  if (!bien) return false;
  await prisma.bien.delete({ where: { idBien } });
  return true;
}
