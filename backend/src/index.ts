import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import { appRoutes } from './routes/app.routes';
import { ressourceIntrouvable, gestionErreurs } from './middlewares/erreurs';

// Création de l'application Express
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', appRoutes);

// Route de santé pour vérifier la disponibilité de l'API et de la base de données
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'ok' });
  } catch {
    res.status(503).json({ status: 'ok', database: 'error' });
  }
});

// Middlewares pour gérer les erreurs et les routes inconnues
app.use(ressourceIntrouvable);
app.use(gestionErreurs);

// Démarrage du serveur sur le port spécifié dans le fichier .env ou par défaut sur 4000
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API EDLoc démarrée sur http://localhost:${port}`);
});