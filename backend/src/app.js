import express from 'express';
import cors from 'cors';
import passport from 'passport';
import 'dotenv/config';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import vehiculosRoutes from './routes/vehiculos.routes.js';
import conductoresRoutes from './routes/conductores.routes.js';
import viajesRoutes from './routes/viajes.routes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
configurePassport();
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/conductores', conductoresRoutes);
app.use('/api/viajes', viajesRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
