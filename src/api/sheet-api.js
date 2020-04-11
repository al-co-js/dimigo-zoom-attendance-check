import fs from 'fs';
import { google } from 'googleapis';

const authorize = async () => {
  const credentials = fs.readFileSync('credentials.json');
  if (!credentials) {
    return null;
  }

  const {
    client_secret: clientSecret,
    client_id: clientId,
    redirect_uris: redirectUris,
  } = JSON.parse(credentials).installed;

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);

  const token = fs.readFileSync('token.json');
  if (!token) {
    return null;
  }

  oAuth2Client.setCredentials(JSON.parse(token));
  return oAuth2Client;
};

const getValues = async (range) => {
  const auth = await authorize();
  if (!auth) {
    return null;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const value = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range,
  });
  if (!value || value.status !== 200) {
    return null;
  }

  return value.data.values;
};

const setValues = async (values, range) => {
  const auth = await authorize();
  if (!auth) {
    return false;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: {
      values,
    },
  });
  if (res.status !== 200) {
    return false;
  }

  return true;
};

export { getValues, setValues };
