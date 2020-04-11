import { Router } from 'express';
import webhookReceived from './controller';

const router = Router();

router.post('/', (req, res) => {
  const data = req.body;
  if (!data) {
    res.sendStatus(412);
    return;
  }

  webhookReceived(data);
  res.sendStatus(200);
});

export default router;
