const User = require('../database/models/user.js');
const { promiseResolver } = require('../scripts/helpers.js');

module.exports = {
  async register(req, res) {
    const {
      user: { password, ...userRest },
    } = req.body;
    const newUser = new User(userRest);

    const [registeredUser, registerError] = await promiseResolver(
      User.register(newUser, password),
    );

    if (registerError) {
      console.error(registerError);
      return res.json({
        success: false,
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
  logout(req, res) {
    req.logout();
    res.json({ success: true });
  },
};
