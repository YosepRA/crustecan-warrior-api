const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const fixtureSchema = new Schema({
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

const Fixture = model('Fixture', fixtureSchema);

module.exports = Fixture;
