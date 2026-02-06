import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import meRoutes from './routes/me.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', meRoutes);

app.get('/', (req, res) => {
  res.send('Backend running');
});

export default app;
