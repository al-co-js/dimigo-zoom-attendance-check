import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  const { event, payload } = req;
  if (!(event && payload)) {
    res.sendStatus(412);
    return;
  }

  console.log(event, payload);
  res.sendStatus(200);
});

export default router;
