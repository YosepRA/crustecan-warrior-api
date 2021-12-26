const User = require('../database/models/user.js');
const { promiseResolver } = require('../scripts/helpers.js');

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
};
