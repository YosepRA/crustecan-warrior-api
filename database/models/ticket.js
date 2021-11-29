const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  fixture: { type: mongoose.Types.ObjectId, ref: 'Fixture' },
  seat: {
    section: 'A',
    seatNumber: '001-0100',
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
