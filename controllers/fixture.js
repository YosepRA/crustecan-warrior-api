const Fixture = require('../database/models/fixture.js');

module.exports = {
  async index(req, res) {
    const {
      query: { increment = 1, includeSeat },
    } = req;

    const query = {};
    const projection = includeSeat === 'false' ? { seats: 0 } : {};
    const limitPerRequest = 3;
    const limit = increment * limitPerRequest;

    const fixtures = await Fixture.find(query, projection)
      .sort({ date: 1 })
      .limit(limit);

    const fixtureTotal = await Fixture.estimatedDocumentCount();

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

    const projection = {
      seats: includeSeat === 'true' ? 1 : 0,
    };

    const fixture = await Fixture.findById(id, projection);

    res.json({ fixture });
  },
};
