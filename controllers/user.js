const stripe = require('stripe')(process.env.STRIPE_SECRET);

const User = require('../database/models/user.js');
const Ticket = require('../database/models/ticket.js');
const Transaction = require('../database/models/transaction.js');
const { promiseResolver } = require('../scripts/helpers.js');
const checkout = require('./helpers/checkout-functions.js');

module.exports = {
  async register(req, res) {
    const { password, ...userRest } = req.body;
    const newUser = new User(userRest);

    const [registeredUser, registerError] = await promiseResolver(
      User.register(newUser, password),
    );

    if (registerError) {
      return res.json({
        success: false,
        message: registerError.message,
      });
    }

    // Establish login session.
    req.login(registeredUser, (err) => {
      if (err) throw err;

      const { username } = registeredUser;
      const userData = {
        username,
      };

      res.json({
        success: true,
        user: userData,
      });
    });

    return undefined;
  },
  login(req, res) {
    const { username } = req.user;
    const userData = {
      username,
    };

    res.json({
      success: true,
      user: userData,
    });
  },
  getLoginSession(req, res) {
    const { username } = req.user;
    const userData = {
      username,
    };

    res.json({
      success: true,
      user: userData,
    });

    return undefined;
  },
  logout(req, res) {
    req.logout();
    res.json({ success: true });
  },
  async ticketList(req, res) {
    const {
      user,
      query: { latest, page },
    } = req;

    const query = { _id: { $in: user.tickets } };
    const sort = { created: -1 };
    const limit = latest === 'true' ? 3 : 10;
    const currentPage = parseInt(page, 10);
    const skip = !Number.isNaN(currentPage) ? (currentPage - 1) * limit : 0;

    const [data, error] = await promiseResolver(
      Ticket.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('fixture', '-seats'),
    );

    if (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }

    const ticketTotal = await Ticket.countDocuments(query);
    const totalPages = Math.ceil(ticketTotal / limit);

    return res.json({
      page: currentPage,
      totalPages,
      length: data.length,
      total: ticketTotal,
      data,
    });
  },
  async transactionList(req, res) {
    const {
      query: { latest, page },
      user,
    } = req;

    const query = { _id: { $in: user.transactions } };
    const projection = '-user -stripeSessionId';
    const sort = { created: -1 };
    const limit = latest === 'true' ? 3 : 10;
    const currentPage = parseInt(page, 10);
    const skip = !Number.isNaN(currentPage) ? (currentPage - 1) * limit : 0;

    const [data, error] = await promiseResolver(
      Transaction.find(query, projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('fixture', '-seats'),
    );

    if (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }

    const transactionTotal = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(transactionTotal / limit);

    return res.json({
      page: currentPage,
      totalPages,
      length: data.length,
      total: transactionTotal,
      data,
    });
  },
  async transactionCancel(req, res) {
    const {
      params: { id },
    } = req;

    const { status, stripeSessionId } = await Transaction.findById(id);

    const [session, expireError] = await promiseResolver(
      stripe.checkout.sessions.expire(stripeSessionId),
    );

    if (expireError) {
      return res.json({
        success: false,
        message: expireError.message,
      });
    }

    if (status === 'open') {
      await checkout.cancelOrder(stripeSessionId);
    }

    return res.json({ success: true });
  },
};
