import { Router } from 'express';
import moment from 'moment';
import 'moment-timezone';
import { getValues, setValues } from '../api/sheet-api';

const router = Router();

const SHEET_NAME = '메인';

const getUserIndex = (allData, userName) => {
  const isIncludes = (value) => userName.includes(value[0]) || userName.includes(value[1]);
  return allData.findIndex(isIncludes) + 1;
};

const parseTime = (joinTime) => {
  const time = moment.tz(joinTime, 'Asia/Seoul');
  return {
    hour: time.hour(),
    minute: time.minute(),
  };
};

const getCurrentSubject = (hour, minute) => {
  if (hour === 8) {
    return '조회';
  }
  if (hour === 17 && minute >= 0) {
    return '종례';
  }
  return undefined;
};

const getParticipantStatus = (minute) => {
  if (minute <= 45) return '출석';
  return '지각';
};

const setUserStatus = async (currentValue, range, value) => {
  if (!currentValue || currentValue === '미출석') {
    await setValues(range, [[value]]);
  }
};

const participantJoined = async (userName, joinTime) => {
  const allData = await getValues(SHEET_NAME);
  const userIndex = getUserIndex(allData, userName);
  if (userIndex === -1) return false;

  const { hour, minute } = parseTime(joinTime);

  const currentSubject = getCurrentSubject(hour, minute);
  if (!currentSubject) return false;

  const participantStatus = getParticipantStatus(minute);

  const column = allData[0].length - 1;
  const currentValue = allData[userIndex - 1][column];
  await setUserStatus(
    currentValue,
    `${SHEET_NAME}!${String.fromCharCode(65 + column)}${userIndex}`,
    `${participantStatus} ${hour}:${minute}`,
  );

  return true;
};

const webhookReceived = async (data) => {
  if (data.event === 'meeting.participant_joined') {
    const { participant } = data.payload.object;
    const result = await participantJoined(participant.user_name, participant.join_time);
    return result;
  }

  return false;
};

router.post('/', async (req, res) => {
  const data = req.body;
  await webhookReceived(data);

  res.sendStatus(200);
});

export default router;
