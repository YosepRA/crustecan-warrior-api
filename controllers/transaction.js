const stripe = require('stripe')(process.env.STRIPE_SECRET);

const Transaction = require('../database/models/transaction.js');
const { promiseResolver } = require('../scripts/helpers.js');

module.exports = {
  async index(req, res) {
    const {
      query: { page },
      user,
    } = req;

    const query = {
      _id: { $in: user.transactions },
    };
    const limit = 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .sort({ created: -1 })
      .skip(skip)
      .limit(limit);

    const transactionTotal = await Transaction.countDocuments(query);

    res.json({
      page,
      length: transactions.length,
      total: transactionTotal,
      data: transactions,
    });
  },
  async cancel(req, res) {
    const {
      params: { id },
    } = req;

    const transaction = await Transaction.findById(id);

    const [session, expireError] = await promiseResolver(
      stripe.checkout.sessions.expire(transaction.stripeSessionId),
    );

    if (expireError) {
      return res.json({
        success: false,
        message: expireError.message,
      });
    }

    return res.json({ success: true });
  },
};
