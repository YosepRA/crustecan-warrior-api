const faker = require('faker');

const Fixture = require('../database/models/fixture.js');
const mongoConnect = require('../database/mongo-connect.js');
const { generateSeats } = require('./helpers.js');

const mongoUrl =
  process.argv[2] || 'mongodb://localhost:27017/crustecan-warrior';

const dbConnection = mongoConnect(mongoUrl);

faker.seed(100);

// Generate fake fixtures given amount parameter.
async function generateFixtures(amount) {
  const fixtures = [];
  const seats = generateSeats();
  const homeTeam = 'Crustecan Warrior FC';
  const opponents = [
    'Fluorascent FC',
    'Royal Kings',
    'Riversouth Union',
    'Gatekeepers',
    'Advancers United',
  ];
  const events = ['Premier League', 'Champions League', 'Vance Cup'];

  for (let num = 0; num < amount; num += 1) {
    const isHome = faker.datatype.boolean();

    const fixture = {
      homeTeam: isHome ? homeTeam : faker.helpers.randomize(opponents),
      awayTeam: isHome ? faker.helpers.randomize(opponents) : homeTeam,
      event: faker.helpers.randomize(events),
      date: faker.date.future(1, new Date()),
      isHome,
      seats,
      isTicketAvailable: true,
    };

    fixtures.push(fixture);
  }

  // Store fixtures list to database.
  await Fixture.create(fixtures);

  console.log(`Successful ${amount} fixtures generation.`);
}

Fixture.deleteMany({})
  .then(() => generateFixtures(10))
  .then(() => {
    dbConnection.close();
  });
