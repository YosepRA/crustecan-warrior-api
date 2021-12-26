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
const transactionRouter = require('./routes/transaction.js');
const userRouter = require('./routes/user.js');

const app = express();

const { PORT, SESSION_SECRET, MONGO_URL, UI_ENDPOINT } = process.env;

const port = PORT || 3000;

let sessionSecret = SESSION_SECRET;
if (!sessionSecret) {
  console.log(
    'You are using unsafe session secret. Provide application with safe secret using environment variable.',
  );
  sessionSecret = 'unsafe_secret';
}

const corsConfig = {
  origin: UI_ENDPOINT,
  credentials: true,
};

/* ========== Database ========== */

const mongoUrl = MONGO_URL || 'mongodb://localhost:27017/crustecan-warrior';
mongoConnect(mongoUrl);

/* ========== Middlewares ========== */

app.use(cors(corsConfig));
app.use(
  session({
    secret: sessionSecret,
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl,
      ttl: 7 * 24 * 60 * 60,
    }),
  }),
);
app.use(logger('dev'));

/* ========== Passport Session Config ========== */

app.use(passport.initialize());
app.use(passport.session());

/* ========== Routes ========== */

app.use('/api/fixture', fixtureRouter);
app.use('/api/ticket', ticketRouter);
app.use('/api/transaction', transactionRouter);
app.use('/api/user', userRouter);

// Demo routes. Delete later.
app.get('/success', (req, res) => {
  res.send('Succeeded.');
});
app.get('/cancel', (req, res) => {
  res.send('Cancelled.');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
