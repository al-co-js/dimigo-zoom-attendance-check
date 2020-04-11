import { Router } from 'express';

const router = Router();

const participantJoined = (userName, joinTime) => {};

const webhookReceived = (data) => {
  if (data.event === 'meeting.participant_joined') {
    const { participant } = data.payload.object;
    return participantJoined(participant.user_name, participant.join_time);
  }
  return false;
};

router.post('/', (req, res) => {
  const data = req.body;

  const result = webhookReceived(data);
  if (!result) {
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

export default router;
