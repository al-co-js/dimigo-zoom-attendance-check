import { Router } from 'express';
import moment from 'moment';
import 'moment-timezone';
import { getValues, setValues } from '../api/sheet-api';

const router = Router();

const SHEET_NAME = '메인';

const getUserIndex = (allData, userName) => {
  const isIncludes = (value) => userName.includes(value[0]) || userName.includes(value[1]);
  const index = allData.findIndex(isIncludes);
  if (index === -1) throw Error(`해당하는 학번, 이름을 찾을 수 없습니다: ${userName}`);
  return index;
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
  if (hour === 16 && minute >= 25) {
    return '종례';
  }
  throw Error('출석하는 시간이 아닙니다.');
};

const getParticipantStatus = (minute) => {
  if (minute <= 45) return '출석';
  return '지각';
};

const setUserStatus = async (currentValue, range, value) => {
  if (!currentValue || currentValue === '민승현') {
    await setValues(range, [[value]]);
  }
};

const participantJoined = async (userName, joinTime) => {
  const allData = await getValues(SHEET_NAME);
  const userIndex = getUserIndex(allData, userName) + 1;

  const { hour, minute } = parseTime(joinTime);

  getCurrentSubject(hour, minute);

  const participantStatus = getParticipantStatus(minute);

  const column = allData[0].length - 1;
  const currentValue = allData[userIndex - 1][column];

  await setUserStatus(
    currentValue,
    `${SHEET_NAME}!${String.fromCharCode(65 + column)}${userIndex}`,
    `${participantStatus} ${hour}:${minute}`,
  );
};

const webhookReceived = async (data) => {
  if (data.event === 'meeting.participant_joined') {
    const { participant } = data.payload.object;
    const result = await participantJoined(participant.user_name, participant.join_time);
    return result;
  }

  throw Error(`구현되지 않은 이벤트입니다: ${data.event}`);
};

router.post('/', async (req, res) => {
  const data = req.body;
  try {
    await webhookReceived(data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    res.sendStatus(400);
    return;
  }

  res.sendStatus(200);
});

export default router;
