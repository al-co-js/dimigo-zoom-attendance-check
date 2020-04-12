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
    month: time.month() + 1,
    date: time.date(),
    hour: time.hour(),
    minute: time.minute(),
  };
};

const getCurrentSubject = (hour, minute) => {
  if (hour === 8) {
    return '조회';
  }
  if (minute === 16 && minute >= 25) {
    return '종례';
  }
  return undefined;
};

const getParticipantStatus = (minute) => {
  if (minute <= 45) return '출석';
  return '지각';
};

const isNewAttendance = (allData, columnName) => {
  if (allData[0][allData[0].length - 1] !== columnName) {
    return true;
  }
  return false;
};

const initializeColumn = async (allData, columnName) => {
  const values = Array(36).fill(['미출석'], 1, 36);
  values[0] = [columnName];
  const columnChar = String.fromCharCode(65 + allData[0].length);
  await setValues(`${SHEET_NAME}!${columnChar}:${columnChar}`, values);
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

  const {
    month, date, hour, minute,
  } = parseTime(joinTime);

  const currentSubject = getCurrentSubject(hour, minute);
  if (!currentSubject) return false;

  const columnName = `${month}/${date} ${currentSubject}`;
  const participantStatus = getParticipantStatus(minute);

  const isNew = isNewAttendance(allData, columnName);
  if (isNew) await initializeColumn(allData, columnName);

  const column = allData[0].length - (isNew ? 0 : 1);
  const currentValue = allData[userIndex - 1][column];
  await setUserStatus(
    currentValue,
    `${SHEET_NAME}!${String.fromCharCode(65 + column)}${userIndex}`,
    `${participantStatus} ${hour}:${minute}`,
  );

  return true;
};

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
