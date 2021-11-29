const Fixture = require('../database/models/fixture.js');

module.exports = {
  async index(req, res) {
    const {
      query: { increment, includeSeat },
    } = req;

    const query = {};
    const projection = {
      seats: includeSeat === 'true' ? 1 : 0,
    };
    const limit = 3;
    const skip = (increment - 1) * limit;

    const fixtures = await Fixture.find(query, projection)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    res.json({ increment, length: fixtures.length, fixtures });
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
