import { Router } from 'express';

import timetable from './timetable';
import webhook from './webhook';

const router = Router();

router.use('/timetable', timetable);
router.use('/webhook', webhook);

export default router;
