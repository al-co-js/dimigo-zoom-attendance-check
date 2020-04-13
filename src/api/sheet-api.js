import fs from 'fs';
import { google } from 'googleapis';

const authorize = async () => {
  const credentials = fs.readFileSync('credentials.json');
  if (!credentials) throw Error('Credential not found.');

  const {
    client_secret: clientSecret,
    client_id: clientId,
    redirect_uris: redirectUris,
  } = JSON.parse(credentials).installed;

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);

  const token = fs.readFileSync('token.json');
  if (!token) throw Error('Token not found.');

  oAuth2Client.setCredentials(JSON.parse(token));
  return oAuth2Client;
};

const getValues = async (range) => {
  const auth = await authorize();

  const sheets = google.sheets({ version: 'v4', auth });
  const value = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range,
  });
  if (!value || value.status !== 200) throw Error('Cannot get values.');

  return value.data.values;
};

const setValues = async (range, values) => {
  const auth = await authorize();

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: {
      values,
    },
  });
  if (res.status !== 200) throw Error('Cannot set values.');
};

export { getValues, setValues };
