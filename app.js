require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const logger = require('morgan');
const MongoStore = require('connect-mongo');

const mongoConnect = require('./database/mongo-connect.js');
const passport = require('./passport/index.js');
const fixtureRouter = require('./routes/fixture.js');
const ticketRouter = require('./routes/ticket.js');
const userRouter = require('./routes/user.js');

const app = express();

const { NODE_ENV, PORT, SESSION_SECRET, MONGO_URL, UI_ORIGIN, DEMO } =
  process.env;

const port = PORT || 3000;
const mongoUrl = MONGO_URL || 'mongodb://localhost:27017/crustecan-warrior';

let sessionSecret = SESSION_SECRET;
if (!sessionSecret) {
  console.log(
    'You are using unsafe session secret. Provide application with safe secret using environment variable.',
  );
  sessionSecret = 'unsafe_secret';
}

const corsConfig = {
  origin: UI_ORIGIN,
  credentials: true,
};
const sessionConfig = {
  secret: sessionSecret,
  saveUninitialized: false,
  resave: false,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  store: MongoStore.create({
    mongoUrl,
    ttl: 7 * 24 * 60 * 60,
  }),
};

if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.sameSite = 'none';
  sessionConfig.cookie.secure = true;
}

/* ========== Database Connection ========== */

mongoConnect(mongoUrl);

/* ========== Middlewares ========== */

app.use(cors(corsConfig));
app.use(session(sessionConfig));
app.use(logger('dev'));

/* ========== Passport Session Config ========== */

app.use(passport.initialize());
app.use(passport.session());

/* ========== Routes ========== */

app.use('/api/fixture', fixtureRouter);
app.use('/api/ticket', ticketRouter);
app.use('/api/user', userRouter);

app.listen(port, () => {
  if (DEMO === 'true') {
    console.log(
      '\x1b[1mNOTICE: You are currently running the demo build. Most mutation operations will be disabled.\x1b[0m',
    );
  }

  console.log(`Server is listening on port ${port}...`);
});
