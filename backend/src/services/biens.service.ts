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

  const [biens, total, communesDistinctes] = await Promise.all([
    prisma.bien.findMany({
      where,
      orderBy: [{ ville: 'asc' }, { adresse: 'asc' }],
      skip,
      take: limite,
      include: {
        // La carte d'un bien affiche le statut de son dernier état des lieux (écran 7).
        _count: { select: { etatsDesLieux: true } },
        etatsDesLieux: {
          orderBy: [{ dateEdl: 'desc' }],
          take: 1,
          select: { idEdl: true, typeEdl: true, statut: true, dateEdl: true },
        },
      },
    }),
    prisma.bien.count({ where }),
    // Alimente la liste déroulante « Commune », indépendante de la recherche en cours.
    prisma.bien.findMany({
      where: { idBailleur },
      distinct: ['ville'],
      orderBy: { ville: 'asc' },
      select: { ville: true },
    }),
  ]);

  const donnees = biens.map(({ _count, etatsDesLieux, ...bien }) => ({
    ...bien,
    nombreEdl: _count.etatsDesLieux,
    dernierEdl: etatsDesLieux[0] ?? null,
  }));

  return {
    donnees,
    communes: communesDistinctes.map((b) => b.ville),
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
