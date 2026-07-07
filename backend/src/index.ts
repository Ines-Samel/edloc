import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import { authRoutes } from './routes/auth.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/sante', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ statut: 'ok', baseDeDonnees: 'ok' });
  } catch {
    res.status(503).json({ statut: 'ok', baseDeDonnees: 'erreur' });
  }
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API EDLoc démarrée sur http://localhost:${port}`);
});