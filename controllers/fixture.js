const Fixture = require('../database/models/fixture.js');

module.exports = {
  async index(req, res) {
    const {
      query: { increment = 1, homeOnly, includeSeat },
    } = req;

    /* ========== Building queries. ========== */

    const query = {};

    if (homeOnly === 'true') query.isHome = true;

    /* ========== Building projections ========== */

    // Default projection by excluding seats.
    const projection = { seats: 0 };

    if (includeSeat === 'true') delete projection.seats;

    /* ========== Pagination ========== */

    const limitPerRequest = 3;
    const limit = increment * limitPerRequest;

    const fixtures = await Fixture.find(query, projection)
      .sort({ date: 1 })
      .limit(limit);

    const fixtureTotal = await Fixture.countDocuments(query);

    res.json({
      increment,
      length: fixtures.length,
      total: fixtureTotal,
      data: fixtures,
    });
  },
  async show(req, res) {
    const {
      params: { id },
      query: { includeSeat },
    } = req;

    const projection = { seats: 0 };

    if (includeSeat === 'true') delete projection.seats;

    const fixture = await Fixture.findById(id, projection);

    res.json({ data: fixture });
  },
};
