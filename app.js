import express, { json, urlencoded, _static } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import Router from './routes/index';

const app = express();

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(_static(join(__dirname, 'public')));

app.use('/webhook', Router);

export default app;
