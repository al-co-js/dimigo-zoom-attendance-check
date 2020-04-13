import { Router } from 'express';
import { promisify } from 'util';
import fs from 'fs';

const router = Router();
const writeFileAsync = promisify(fs.writeFile);

router.post('/', async (req, res) => {
  const data = req.body;
  try {
    await writeFileAsync('timetable.json', JSON.stringify(data));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    res.sendStatus(500);
    return;
  }
  res.sendStatus(200);
});

export default router;
