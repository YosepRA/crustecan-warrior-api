const mongoose = require('mongoose');

const fixtureSchema = new mongoose.Schema({
  homeTeam: String,
  awayTeam: String,
  event: String,
  date: Date,
  isHome: Boolean,
  seats: [
    {
      section: String,
      seatNumber: String,
      isAvailable: Boolean,
    },
  ],
  isTicketAvailable: Boolean,
});

const Fixture = mongoose.model('Fixture', fixtureSchema);

module.exports = Fixture;
