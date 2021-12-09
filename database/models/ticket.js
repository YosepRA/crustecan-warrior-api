const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const ticketSchema = new Schema({
  fixture: { type: Schema.Types.ObjectId, ref: 'Fixture' },
  seat: {
    section: String,
    seatNumber: String,
  },
});

const Ticket = model('Ticket', ticketSchema);

module.exports = Ticket;
