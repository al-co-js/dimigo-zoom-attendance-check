import { Router } from 'express';
import { getValues, setValues } from '../api/sheet-api';

const router = Router();

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

const participantJoined = async (userName, joinTime) => {
  let name = '';
  let isBreak = false;
  for (let i = 0; i < 35; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      if (userName.includes(users[i][j])) {
        [, name] = users[i];
        isBreak = true;
        break;
      }
    }
    if (isBreak) {
      break;
    }
  }
  if (name === '') {
    return false;
  }

  const buf = joinTime.split('T');
  if (!buf || buf.length !== 2) {
    return false;
  }
  const date = buf[0].substring(buf[0].indexOf('-') + 1).replace('-', '/');
  const time = buf[1].split('Z')[0];
  if (!(date && time)) {
    return false;
  }

  let [h, m] = time.split(':');
  h = Number.parseInt(h, 10);
  m = Number.parseInt(m, 10);

  let now = '';
  if (h === 8) {
    now = '조회';
  } else if (h === 16 && m >= 25) {
    now = '종례';
  }
  if (now === '') {
    return false;
  }

  let status = '';
  if (m <= 45) {
    status = '출석';
  } else if (m >= 46) {
    status = '지각';
  }

  const allData = await getValues('메인');
  if (!allData) {
    return false;
  }

  let isNew = false;
  if (allData[0][allData[0].length - 1] !== `${date} ${now}`) {
    const res = await setValues(
      [[`${date} ${now}`]],
      `메인!${String.fromCharCode(65 + allData[0].length)}1`,
    );
    if (!res) {
      return false;
    }
    isNew = true;
  }

  let i = 0;
  let res = true;
  allData.forEach(async () => {
    if (allData[i][1] === name) {
      res = await setValues(
        [[`${status} ${h}:${m}`]],
        `메인!${String.fromCharCode(65 + allData[0].length - (isNew ? 0 : 1))}${i + 1}`,
      );
      if (!res) {
        return;
      }
    }
    i += 1;
  });

  return res;
};

const webhookReceived = (data) => {
  if (data.event === 'meeting.participant_joined') {
    const { participant } = data.payload.object;
    return participantJoined(participant.user_name, participant.join_time);
  }
  return false;
};

router.get('/', (req, res) => {
  res.send(participantJoined('민승현', '2020-04-11T8:43:13Z'));
});

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
