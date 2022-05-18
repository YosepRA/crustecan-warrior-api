const faker = require('faker');

const Fixture = require('./models/fixture.js');
const Transaction = require('./models/transaction.js');
const Ticket = require('./models/ticket.js');
const User = require('./models/user.js');
const mongoConnect = require('./mongo-connect.js');
const { generateSeats } = require('../scripts/helpers.js');

const amountArg = parseInt(process.argv[2], 10) || 10;
const userIdArg = process.argv[3] || '61b33ea9af18fa1a58d147e6';
const mongoUrl =
  process.argv[4] || 'mongodb://localhost:27017/crustecan-warrior';

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

async function resetAndGenerateFixtures(amount) {
  await Fixture.deleteMany({});
  await generateFixtures(amount);
}

async function resetUser(userId) {
  const user = await User.findById(userId);

  user.transactions = [];
  user.tickets = [];

  await user.save();
}

function resetTransaction(query = {}) {
  return Transaction.deleteMany(query);
}

function resetTicket(query = {}) {
  return Ticket.deleteMany(query);
}

/* ========== Main code ========== */

// Generate fixtures.

const fixturePromise = resetAndGenerateFixtures(amountArg);

// And reset everything else.

const userPromise = resetUser(userIdArg).then(() =>
  console.log('Reset user is successful.'),
);

const transactionPromise = resetTransaction().then(() =>
  console.log('Reset transaction is successful.'),
);

const ticketPromise = resetTicket().then(() =>
  console.log('Reset ticket is successful.'),
);

Promise.all([
  fixturePromise,
  userPromise,
  transactionPromise,
  ticketPromise,
]).then(() => {
  console.log('Seeding is completed.');

  dbConnection.close();
});
