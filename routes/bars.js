var Bar = require('../models/bar');
var cuid = require('cuid');

module.exports = function(app, passport) {
 app.get('/api/bars', function(req, res) {
  Bar.find().sort('-dateAdded').exec((err, bars) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ bars });
    });
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
      console.log("authenticated");
      return next(); 
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}
