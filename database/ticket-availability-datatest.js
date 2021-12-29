/* Provides data for ticket's availability test. */

const Fixture = require('./models/fixture.js');
const mongoConnect = require('./mongo-connect.js');

const amountArg = parseInt(process.argv[2], 10) || 1;
const fixtureIdArg = process.argv[3] || '61a349fca56d68263cd101c9';
const mongoUrl = 'mongodb://localhost:27017/crustecan-warrior';

const dbConnection = mongoConnect(mongoUrl);

function chooseRandomSeats(seats, amount) {
  const randomSeats = [];

  for (let num = 0; num < amount; num += 1) {
    const randomIndex = Math.floor(Math.random() * seats.length);

    randomSeats.push(seats[randomIndex]);
  }

  return randomSeats;
}

/* Disable fixture's seats availability except for a given amount of seats. */
async function createTestData(fixtureId, amount) {
  const fixture = await Fixture.findById(fixtureId);
  const { seats } = fixture;

  const enabledSeats = chooseRandomSeats(seats, amount);

  seats.forEach((seat) => {
    if (
      enabledSeats.find(
        (enabledSeat) =>
          enabledSeat.section === seat.section &&
          enabledSeat.seatNumber === seat.seatNumber,
      )
    ) {
      seat.isAvailable = true;
    } else {
      seat.isAvailable = false;
    }
  });

  // seats[0].isAvailable = true;
  fixture.isTicketAvailable = true;

  await fixture.save();

  return enabledSeats;
}

createTestData(fixtureIdArg, amountArg)
  .then((enabledSeats) => {
    console.log('Ticket availability data test is ready.');

    const seatNumbers = enabledSeats.map(
      (seat) => `${seat.section}-${seat.seatNumber}`,
    );

    console.log(`Enabled seats: ${seatNumbers.join(', ')}`);
  })
  .then(() => {
    dbConnection.close();
  });
