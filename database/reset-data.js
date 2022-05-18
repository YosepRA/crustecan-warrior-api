const Fixture = require('./models/fixture.js');
const Transaction = require('./models/transaction.js');
const Ticket = require('./models/ticket.js');
const User = require('./models/user.js');
const mongoConnect = require('./mongo-connect.js');

const userIdArg = process.argv[2] || '61b33ea9af18fa1a58d147e6';
const mongoUrl =
  process.argv[3] || 'mongodb://localhost:27017/crustecan-warrior';

const dbConnection = mongoConnect(mongoUrl);

async function resetUser(userId) {
  const user = await User.findById(userId);

  user.transactions = [];
  user.tickets = [];

  await user.save();
}

function resetAllData(userId) {
  const fixturePromise = Fixture.deleteMany({});
  const userPromise = resetUser(userId);
  const transactionPromise = Transaction.deleteMany({});
  const ticketPromise = Ticket.deleteMany({});

  return Promise.all([
    fixturePromise,
    userPromise,
    transactionPromise,
    ticketPromise,
  ]);
}

resetAllData(userIdArg).then(() => {
  console.log('Reset data is successful.');

  dbConnection.close();
});
