import { Router } from 'express';
import webhookReceived from './controller';

const router = Router();

router.post('/', (req, res) => {
  const data = req.body;
  webhookReceived(data);
  res.sendStatus(200);
});

export default router;
