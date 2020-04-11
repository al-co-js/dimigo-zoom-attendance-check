import fs from 'fs';
import { google } from 'googleapis';

const authorize = (callback) => {
  fs.readFile('credentials.json', (_err, content) => {
    const {
      client_secret: clientSecret,
      client_id: clientId,
      redirect_uris: redirectUris,
    } = JSON.parse(content).installed;

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);

    fs.readFile('token.json', (_err, token) => {
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  });
};

class Sheet {
  constructor() {
    this.getValues = (range, callback) => {
      authorize((auth) => {
        const sheets = google.sheets({ version: 'v4', auth });
        sheets.spreadsheets.values.get(
          {
            spreadsheetId: process.env.SHEET_ID,
            range,
          },
          callback,
        );
      });
    };
  }
}

export default new Sheet();
