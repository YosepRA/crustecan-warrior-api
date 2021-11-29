require('dotenv').config();

const express = require('express');

const mongoConnect = require('./database/mongo-connect.js');
const fixtureRouter = require('./routes/fixture.js');

const app = express();
const port = process.env.PORT || 3000;

/* ========== Database ========== */

const mongoUrl =
  process.env.MONGO_URL || 'mongodb://localhost:27017/crustecan-warrior';
mongoConnect(mongoUrl);

/* ========== Routes ========== */

app.use('/api/fixture', fixtureRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
