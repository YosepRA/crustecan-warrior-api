const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  fixture: { type: Schema.Types.ObjectId, ref: 'Fixture' },
  orders: [
    {
      section: String,
      seatNumber: String,
    },
  ],
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  stripeSessionId: String,
});

const Transaction = model('Transaction', transactionSchema);

module.exports = Transaction;
