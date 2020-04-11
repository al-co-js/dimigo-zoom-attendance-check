import { Router } from 'express';
import moment from 'moment';
import 'moment-timezone';
import { getValues, setValues } from '../api/sheet-api';

const router = Router();

const SHEET_NAME = '메인';
const users = [
  ['2301', '강정민'],
  ['2302', '고주현'],
  ['2303', '고준영'],
  ['2304', '권순재'],
  ['2305', '김경훈'],
  ['2306', '김성훈'],
  ['2307', '김영상'],
  ['2308', '김유빈'],
  ['2309', '김재우'],
  ['2310', '김창진'],
  ['2311', '김채린'],
  ['2312', '민승현'],
  ['2313', '박성준'],
  ['2314', '박성진'],
  ['2315', '박세준'],
  ['2316', '박주원'],
  ['2317', '배민규'],
  ['2318', '백은서'],
  ['2319', '서동휘'],
  ['2320', '신현욱'],
  ['2321', '심재성'],
  ['2322', '양희수'],
  ['2323', '유태연'],
  ['2324', '윤진혁'],
  ['2325', '이선우'],
  ['2326', '이정연'],
  ['2327', '장종우'],
  ['2328', '정성원'],
  ['2329', '정성집'],
  ['2330', '정재엽'],
  ['2331', '조민수'],
  ['2332', '조영민'],
  ['2333', '최승현'],
  ['2334', '최재희'],
  ['2335', '황민지'],
];

const getUserIndex = (userName) => {
  let name = '';
  let index = 1;
  let isBreak = false;
  for (let i = 0; i < 35; i += 1) {
    index += 1;
    for (let j = 0; j < 2; j += 1) {
      if (userName.includes(users[i][j])) {
        [, name] = users[i];
        isBreak = true;
        break;
      }
    }
    if (isBreak) break;
  }
  if (name === '') return -1;
  return index;
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
  await setValues(values, `${SHEET_NAME}!${columnChar}:${columnChar}`);
};

const setUserStatus = async (currentValue, range, value) => {
  if (!currentValue || currentValue === '미출석') {
    await setValues([[value]], range);
  }
};

const participantJoined = async (userName, joinTime) => {
  const userIndex = getUserIndex(userName);
  if (userIndex === -1) return false;

  const {
    month, date, hour, minute,
  } = parseTime(joinTime);

  const currentSubject = getCurrentSubject(hour, minute);
  if (!currentSubject) return false;

  const columnName = `${month}/${date} ${currentSubject}`;
  const participantStatus = getParticipantStatus(minute);
  const allData = await getValues(SHEET_NAME);

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
