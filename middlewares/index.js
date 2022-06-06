const passport = require('passport');

const { DEMO } = process.env;

module.exports = {
  isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
      return res.status(401).send('You are not authenticated.');
    }
    return next();
  },
  authenticateLogin(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.sendStatus(500);
      }

      if (!user) {
        const { message } = info;

        return res.json({
          success: false,
          message,
        });
      }

      req.login(user, (loginError) => {
        if (loginError) return res.sendStatus(500);
        return next();
      });

      return undefined;
    })(req, res, next);
  },
  demo(req, res, next) {
    if (DEMO === 'true') {
      return res.send('Feature is disabled on demo build.');
    }

    return next();
  },
};
