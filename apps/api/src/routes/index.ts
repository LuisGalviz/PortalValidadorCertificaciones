import { Router } from 'express';
import authRouter from './auth.js';
import dashboardRouter from './dashboard.js';
import reportsRouter from './reports.js';
import oiasRouter from './oias.js';
import inspectorsRouter from './inspectors.js';
import constructionCompaniesRouter from './construction-companies.js';
import catalogsRouter from './catalogs.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/reports', reportsRouter);
router.use('/oias', oiasRouter);
router.use('/inspectors', inspectorsRouter);
router.use('/construction-companies', constructionCompaniesRouter);
router.use('/catalogs', catalogsRouter);

export default router;
