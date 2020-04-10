import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  const data = req.body;
  if (!data) {
    res.sendStatus(412);
    return;
  }

  res.sendStatus(200);
});

export default router;
